import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { MailModule } from './mail/mail.module';
import { SignatureModule } from './signature/signature.module';
import { UserModule } from './user/user.module';
import { User, UserRole } from './user/entities/user.entity';
import { SplitSheetModule } from './split-sheet/split-sheet.module';
import { SplitSheet } from './split-sheet/entities/split-sheet.entity';
import { Collaborator } from './split-sheet/entities/collaborator.entity';
import { AuthModule } from './auth/auth.module';

// New Modules
import { CatalogModule } from './catalog/catalog.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { ContactsModule } from './contacts/contacts.module';
import { Catalog } from './catalog/entities/catalog.entity';
import { Track } from './catalog/entities/track.entity';
import { AuditLog } from './audit-log/entities/audit-log.entity';
import { Contact } from './contacts/entities/contact.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate Limiting: 10 requests per 60 seconds per IP (Basic DDoS protection)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'saldana_music',
      entities: [User, SplitSheet, Collaborator, Catalog, Track, AuditLog, Contact],
      synchronize: true, // Auto-schema update for Dev
    }),
    MailModule,
    SignatureModule,
    CatalogModule,
    AuditLogModule,
    ContactsModule,
    UserModule,
    SplitSheetModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

  async onModuleInit() {
    const userRepository = this.dataSource.getRepository(User);
    const masterEmail = 'info@saldanamusic.com'; // Updated as per request
    const existingMaster = await userRepository.findOne({ where: { email: masterEmail } });

    if (!existingMaster) {
      console.log('Creating Master User...');
      const master = userRepository.create({
        email: masterEmail,
        firstName: 'Master',
        lastName: 'Admin',
        role: UserRole.MASTER,
        // Security Fix: Use Env Var
        passwordHash: process.env.MASTER_PASSWORD || 'ChangeMeASAP2027!',
        isActive: true,
      });
      await userRepository.save(master);
      console.log('Master User created successfully.');
    }
  }
