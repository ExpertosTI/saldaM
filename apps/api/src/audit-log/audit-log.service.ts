import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../user/entities/user.entity';

type UserRef = Pick<User, 'id'>;

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: string,
    details: string,
    user?: UserRef | User,
    ipAddress?: string,
  ) {
    try {
      const logEntry = this.auditLogRepository.create({
        action,
        details,
        user: user ? ({ id: user.id } as User) : null,
        ipAddress,
      });
      return await this.auditLogRepository.save(logEntry);
    } catch (error) {
      this.logger.error(
        `Failed to write audit log action=${action}`,
        error instanceof Error ? error.stack : String(error),
      );
      return null;
    }
  }
}
