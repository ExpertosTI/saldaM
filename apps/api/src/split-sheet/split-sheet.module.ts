import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SplitSheetService } from './split-sheet.service';
import { SplitSheetController } from './split-sheet.controller';
import { SplitSheet } from './entities/split-sheet.entity';
import { Collaborator } from './entities/collaborator.entity';
import { SignatureModule } from '../signature/signature.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MailModule } from '../mail/mail.module';
import { ContactsModule } from '../contacts/contacts.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SplitSheet, Collaborator]),
    SignatureModule,
    AuditLogModule,
    MailModule,
    ContactsModule,
    AuthModule,
  ],
  controllers: [SplitSheetController],
  providers: [SplitSheetService],
})
export class SplitSheetModule {}
