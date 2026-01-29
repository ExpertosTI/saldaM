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
}
