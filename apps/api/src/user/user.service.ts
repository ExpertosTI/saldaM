import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, KycStatus } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private mailService: MailService,
        private auditLogService: AuditLogService,
    ) { }

    async create(createUserDto: any) {
        // 1. Check if user exists
        const existing = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (existing) {
            throw new Error('User already exists');
        }

        // 2. Create User
        const user = this.userRepository.create({
            ...createUserDto,
            role: UserRole.USER, // Default role
            userType: createUserDto.userType || null,
            isEmailVerified: false,
            kycStatus: KycStatus.PENDING,
        });
        const savedUser = (await this.userRepository.save(user)) as unknown as User;

        // 3. Send Welcome Email (Notifications Requirement)
        try {
            await this.mailService.sendUserWelcome(savedUser.email, savedUser.firstName || 'Usuario');
        } catch (e) {
            console.error('Failed to send welcome email', e);
        }

        // 4. Log Action (Audit Requirement)
        await this.auditLogService.log('USER_SIGNUP', `User ${savedUser.email} registered.`, savedUser);

        return savedUser;
    }

    async findOne(email: string) {
        return this.userRepository.findOne({ where: { email } });
    }

    async updateProfile(id: string, data: any) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new Error("User not found");

        if (data.firstName) user.firstName = data.firstName;
        if (data.lastName) user.lastName = data.lastName;
        if (data.phone) user.phone = data.phone;
        if (data.bio) user.bio = data.bio;
        if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
        if (data.proAffiliation) user.proAffiliation = data.proAffiliation;
        if (data.ipiNumber) user.ipiNumber = data.ipiNumber;
        if (data.userType) user.userType = data.userType; // Allow updating userType (e.g. from onboarding)

        return this.userRepository.save(user);
    }
}
