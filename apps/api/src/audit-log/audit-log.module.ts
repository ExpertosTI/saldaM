import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    providers: [AuditLogService],
    exports: [AuditLogService], // Exported to be used by other modules
})
export class AuditLogModule { }
