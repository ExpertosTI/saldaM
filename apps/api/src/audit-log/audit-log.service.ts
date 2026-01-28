import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) { }

    async log(action: string, details: string, user?: User, ipAddress?: string) {
        const logEntry = this.auditLogRepository.create({
            action,
            details,
            user,
            ipAddress,
        });
        return this.auditLogRepository.save(logEntry);
    }
}
