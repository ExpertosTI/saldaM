import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { MailModule } from './mail/mail.module';
import { SignatureModule } from './signature/signature.module';
import { User, UserRole } from './user/entities/user.entity';
import { SplitSheet } from './split-sheet/entities/split-sheet.entity';
import { Collaborator } from './split-sheet/entities/collaborator.entity';

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
      entities: [User, SplitSheet, Collaborator],
      synchronize: true, // Auto-schema update for Dev
    }),
    MailModule,
    SignatureModule,
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
    const masterEmail = 'expertostird@gmail.com';
    const existingMaster = await userRepository.findOne({ where: { email: masterEmail } });

    if (!existingMaster) {
      console.log('Creating Master User...');
      const master = userRepository.create({
        email: masterEmail,
        firstName: 'Master',
        lastName: 'Admin',
        role: UserRole.MASTER,
        // Since we don't have a hash service injected here easily, 
        // we'll assume the Auth flow handles password setting or we set a temp hash if needed.
        // For now, we create the user so they can "Forgot Password" or we depend on a seed script.
        // BETTER: Use a default known hash if possible, or just create it.
        // Let's create it with a placeholder so it exists.
        isActive: true, // Assuming we might add this later, but for now just create.
      });
      await userRepository.save(master);
      console.log('Master User created successfully.');
    }
  }
}
