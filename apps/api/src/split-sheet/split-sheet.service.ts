
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SplitSheet, SplitSheetStatus } from './entities/split-sheet.entity';
import { User } from '../user/entities/user.entity';
import { SignatureService } from '../signature/signature.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MailService } from '../mail/mail.service';
import { ContactsService } from '../contacts/contacts.service';
import { UserService } from '../user/user.service';
import { ContactRole } from '../contacts/entities/contact.entity';
import { Collaborator, CollaboratorRole } from './entities/collaborator.entity';
import * as crypto from 'crypto';

@Injectable()
export class SplitSheetService {
    constructor(
        @InjectRepository(SplitSheet)
        private splitSheetRepository: Repository<SplitSheet>,
        private signatureService: SignatureService,
        private auditLogService: AuditLogService,
        private mailService: MailService,
        private contactsService: ContactsService,
        private userService: UserService,
    ) { }

    async startSignatures(id: string, user: any) {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) throw new NotFoundException('Split Sheet not found');

        if (splitSheet.owner?.id !== user.id) {
            throw new ForbiddenException('Only owner can start signatures');
        }

        if (splitSheet.status === SplitSheetStatus.PENDING_SIGNATURES) {
            throw new ConflictException('Split Sheet is already pending signatures');
        }
        if (splitSheet.status === SplitSheetStatus.COMPLETED) {
            throw new ConflictException('Split Sheet is already completed');
        }
        if (splitSheet.status !== SplitSheetStatus.DRAFT) {
            throw new ConflictException('Split Sheet cannot start signatures from current status');
        }

        splitSheet.status = SplitSheetStatus.PENDING_SIGNATURES;
        await this.splitSheetRepository.save(splitSheet);

        await this.auditLogService.log('SHEET_STATUS_CHANGE',
            `Split Sheet ${id} moved to PENDING_SIGNATURES by ${user.email}`,
            user);

        // Send signature request emails to all collaborators
        const ownerName = user.firstName ? `${user.firstName} ${user.lastName}` : user.email;
        for (const collab of splitSheet.collaborators) {
            if (!collab.hasSigned && collab.email !== user.email) {
                try {
                    const signLink = `https://app.saldanamusic.com/split-sheets/${id}`;
                    await this.mailService.sendSignatureRequest(
                        collab.email,
                        ownerName,
                        splitSheet.title,
                        signLink
                    );
                } catch (e) {
                    console.error(`Failed to send signature request to ${collab.email}`, e);
                }
            }
        }

        return {
            ...splitSheet,
            message: 'Signature process started. Signature requests were sent to collaborators.',
            status: splitSheet.status,
        };
    }

    async sign(id: string, user: any) {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) throw new Error('Split Sheet not found');

        // Check if collaborator
        const collaborator = splitSheet.collaborators.find(c => c.email === user.email);

        // OR owner (if owner is also a collaborator in the list, fine. If separate, handle safely)
        const isOwner = splitSheet.owner?.id === user.id;

        if (!collaborator && !isOwner) {
            throw new Error('You are not a collaborator on this sheet');
        }

        // If owner is signing, do they have a collaborator entry? 
        // For MVP, we assume owner created a row for themselves if they want 50%.
        // If not, we just log a generic signature? 
        // Let's assume we REQUIRE a collaborator entry to sign.
        if (!collaborator) {
            throw new Error('Owner must be listed as a collaborator to sign for a split.');
        }

        if (collaborator.hasSigned) {
            return { message: 'Already signed', status: splitSheet.status };
        }

        collaborator.hasSigned = true;
        collaborator.signedAt = new Date();
        collaborator.ipAddress = user.ipAddress || '0.0.0.0';

        await this.splitSheetRepository.save(splitSheet); // Cascades to collaborators

        await this.auditLogService.log('SIGNATURE_ADDED',
            `User ${user.email} signed Split Sheet ${id}`,
            user);

        // Check if ALL signed
        const allSigned = splitSheet.collaborators.every(c => c.hasSigned);
        if (allSigned) {
            splitSheet.status = SplitSheetStatus.COMPLETED;
            splitSheet.finalDocHash = crypto.randomUUID(); // Mock hash
            await this.splitSheetRepository.save(splitSheet);

            await this.auditLogService.log('SHEET_COMPLETED',
                `Split Sheet ${id} is fully signed and COMPLETED.`,
                user);
        }

        return { message: 'Signed successfully', status: splitSheet.status };
    }

    async create(createSplitSheetDto: any, reqUser: any): Promise<SplitSheet> {
        // Ensure we have the full user entity
        const user = await this.userService.findOne(reqUser.id);
        if (!user) throw new NotFoundException('User not found');

        // Validation and Mapping
        if (createSplitSheetDto.collaborators) {
            createSplitSheetDto.collaborators.forEach(c => {
                if (!c.email) throw new ConflictException('All collaborators must have an email address');
                if (c.name && !c.legalName) c.legalName = c.name; // Polyfill
            });
        }

        const splitSheet = this.splitSheetRepository.create({
            ...createSplitSheetDto,
            owner: user,
        });

        const saved = await this.splitSheetRepository.save(splitSheet) as unknown as SplitSheet;

        // Auxiliary operations (Non-blocking)
        try {
            await this.auditLogService.log('SPLIT_SHEET_CREATED', `User ${user.email} created split sheet ${saved.id}`, user);

            // Send confirmation email to owner
            const link = `https://app.saldanamusic.com/split-sheets/${saved.id}`; // Hardcoded for now based on env vars context
            await this.mailService.sendSplitSheetCreated(user.email, user.firstName || 'Usuario', saved.title, link);

        } catch (e) {
            console.error('Failed to create audit log or send email', e);
        }

        try {
            // Auto-add collaborators to contacts
            if (createSplitSheetDto.collaborators && Array.isArray(createSplitSheetDto.collaborators)) {
                for (const collab of createSplitSheetDto.collaborators) {
                    // Skip adding self as contact
                    if (collab.email && collab.email !== user.email) {
                        // safe call
                        await this.ensureContactExists(user, collab.email, collab.legalName || collab.name, collab.role);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to auto-add contacts', e);
        }

        return saved;
    }

    async findAllByUser(userId: string, email: string) {
        return this.splitSheetRepository.find({
            where: [
                { owner: { id: userId } },
                { collaborators: { email: email } }
            ],
            relations: ['collaborators', 'owner'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, user?: any) {
        const sheet = await this.splitSheetRepository.findOne({
            where: { id },
            relations: ['collaborators', 'owner'],
        });
        if (!sheet) return null;

        // Verificar acceso: owner o collaborador
        if (user) {
            const isOwner = sheet.owner?.id === user.id;
            const isCollaborator = sheet.collaborators?.some(c => c.email === user.email);
            if (!isOwner && !isCollaborator) {
                throw new Error('Unauthorized: You do not have access to this split sheet');
            }
        }
        return sheet;
    }

    async downloadPdf(id: string, user: any): Promise<Buffer> {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) {
            throw new Error('Split Sheet not found');
        }

        // Security Check
        const isOwner = splitSheet.owner?.id === user.id;
        const isCollaborator = splitSheet.collaborators.some(c => c.email === user.email);

        if (!isCollaborator && !isOwner) {
            throw new Error('You do not have permission to download this file');
        }

        return this.signatureService.generateSplitSheetPdf(splitSheet);
    }

    async downloadFullPdf(id: string, user: any): Promise<Buffer> {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) {
            throw new Error('Split Sheet not found');
        }

        const isOwner = splitSheet.owner?.id === user.id;
        const isCollaborator = splitSheet.collaborators.some(c => c.email === user.email);

        if (!isCollaborator && !isOwner) {
            throw new Error('You do not have permission to download this file');
        }

        return this.signatureService.generateFullSplitSheetPdf(splitSheet);
    }

    async generateInvite(id: string, user: any): Promise<string> {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) throw new Error('Split Sheet not found');

        if (splitSheet.owner?.id !== user.id) {
            throw new Error('Only owner can generate invite links');
        }

        if (!splitSheet.inviteToken) {
            splitSheet.inviteToken = crypto.randomUUID();
            await this.splitSheetRepository.save(splitSheet);
        }
        return splitSheet.inviteToken;
    }

    async joinViaInvite(token: string, user: any) {
        const splitSheet = await this.splitSheetRepository.findOne({
            where: { inviteToken: token },
            relations: ['collaborators']
        });

        if (!splitSheet) throw new Error('Invalid invite token');

        // Check if already a collaborator
        const exists = splitSheet.collaborators.some(c => c.email === user.email);
        if (exists) return { message: 'Already a collaborator', splitSheetId: splitSheet.id };

        // Add as new collaborator
        // We need to inject CollaboratorRepository or just use cascade if we modify the array?
        // Cascade is on, so pushing to array and saving split sheet should work.
        const newCollab = new Collaborator();
        newCollab.email = user.email;
        newCollab.legalName = user.firstName ? `${user.firstName} ${user.lastName}` : 'Guest';
        newCollab.role = CollaboratorRole.SONGWRITER; // Default role
        newCollab.percentage = 0; // Default 0
        newCollab.splitSheet = splitSheet;

        splitSheet.collaborators.push(newCollab);
        await this.splitSheetRepository.save(splitSheet);

        // Auto-add the NEW collaborator to the OWNER's contacts
        if (splitSheet.owner) {
            await this.ensureContactExists(splitSheet.owner, newCollab.email, newCollab.legalName, newCollab.role);
        }

        return { message: 'Joined successfully', splitSheetId: splitSheet.id };
    }

    async getStats(user: any) {
        const total = await this.splitSheetRepository.count({
            where: [
                { owner: { id: user.id } },
                { collaborators: { email: user.email } }
            ]
        });
        const pending = await this.splitSheetRepository.count({
            where: [
                { owner: { id: user.id }, status: SplitSheetStatus.PENDING_SIGNATURES },
                { collaborators: { email: user.email }, status: SplitSheetStatus.PENDING_SIGNATURES }
            ]
        });
        return {
            totalSongs: total,
            pendingSignatures: pending,
            estimatedRoyalties: 0,
        };
    }

    async deleteSplitSheet(id: string, user: any) {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) throw new Error('Split Sheet not found');
        if (splitSheet.owner?.id !== user.id) {
            throw new Error('Only owner can delete this split sheet');
        }
        if (splitSheet.status === SplitSheetStatus.COMPLETED) {
            throw new Error('Cannot delete a completed split sheet');
        }
        await this.auditLogService.log('SPLIT_SHEET_DELETED', `User ${user.email} deleted split sheet ${id}`, user);
        await this.splitSheetRepository.remove(splitSheet);
        return { message: 'Split sheet deleted successfully' };
    }

    async addCollaborator(id: string, user: any, collaboratorData: { email: string; legalName: string; role: CollaboratorRole; percentage: number }) {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) throw new Error('Split Sheet not found');
        if (splitSheet.owner?.id !== user.id) {
            throw new Error('Only owner can add collaborators');
        }
        if (splitSheet.status !== SplitSheetStatus.DRAFT) {
            throw new Error('Cannot modify collaborators after signatures started');
        }
        const exists = splitSheet.collaborators.some(c => c.email === collaboratorData.email);
        if (exists) throw new Error('Collaborator already exists');

        const newCollab = new Collaborator();
        newCollab.email = collaboratorData.email;
        newCollab.legalName = collaboratorData.legalName;
        newCollab.role = collaboratorData.role;
        newCollab.percentage = collaboratorData.percentage;
        newCollab.splitSheet = splitSheet;

        splitSheet.collaborators.push(newCollab);
        await this.splitSheetRepository.save(splitSheet);
        await this.auditLogService.log('COLLABORATOR_ADDED', `Collaborator ${collaboratorData.email} added to split sheet ${id}`, user);

        // Auto-add to contacts
        if (collaboratorData.email !== user.email) {
            await this.ensureContactExists(user, collaboratorData.email, collaboratorData.legalName, collaboratorData.role);
        }

        return splitSheet;
    }

    async removeCollaborator(id: string, user: any, collaboratorEmail: string) {
        const splitSheet = await this.findOne(id);
        if (!splitSheet) throw new Error('Split Sheet not found');
        if (splitSheet.owner?.id !== user.id) {
            throw new Error('Only owner can remove collaborators');
        }
        if (splitSheet.status !== SplitSheetStatus.DRAFT) {
            throw new Error('Cannot modify collaborators after signatures started');
        }
        const collabIndex = splitSheet.collaborators.findIndex(c => c.email === collaboratorEmail);
        if (collabIndex === -1) throw new Error('Collaborator not found');

        splitSheet.collaborators.splice(collabIndex, 1);
        await this.splitSheetRepository.save(splitSheet);
        await this.auditLogService.log('COLLABORATOR_REMOVED', `Collaborator ${collaboratorEmail} removed from split sheet ${id}`, user);
        return { message: 'Collaborator removed successfully' };
    }

    private async ensureContactExists(user: any, collaboratorEmail: string, collaboratorName: string, role: string) {
        // Find existing contact
        const existing = await this.contactsService.findAll(user, { search: collaboratorEmail });
        const exists = existing.find(c => c.email === collaboratorEmail);

        if (!exists) {
            try {
                // Map collaborator role to contact role
                let contactRole = ContactRole.OTHER;
                switch (role) {
                    case CollaboratorRole.SONGWRITER: contactRole = ContactRole.SONGWRITER; break;
                    case CollaboratorRole.PRODUCER: contactRole = ContactRole.PRODUCER; break;
                    case CollaboratorRole.PUBLISHER: contactRole = ContactRole.PUBLISHER; break;
                }

                await this.contactsService.create({
                    name: collaboratorName,
                    email: collaboratorEmail,
                    role: contactRole,
                    phone: '', // Optional
                    notes: 'Automatically added from Split Sheet',
                }, user);
            } catch (error) {
                console.error(`Failed to auto-create contact for ${collaboratorEmail}`, error);
            }
        }
    }
}
