import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { KycController } from './kyc.controller';
import { User } from './entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
    AuditLogModule,
    forwardRef(() => ContactsModule),
  ],
  controllers: [UserController, KycController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
