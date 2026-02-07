import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers (Helmet)
  // 1. Security Headers (Helmet)
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow resources to be loaded from other origins
  }));

  // Enable Trust Proxy for Load Balancers (Traefik/Nginx)
  try {
    const expressApp = app.getHttpAdapter().getInstance();
    if (expressApp && typeof expressApp.set === 'function') {
      expressApp.set('trust proxy', 1);
    }
  } catch (error) {
    console.warn('Failed to set trust proxy:', error);
  }

  // 2. CORS (Restricted to specific domains)
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://app.saldanamusic.com', 'https://saldanamusic.com', 'https://www.saldanamusic.com']
      : true, // Allow all in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // 3. Compression (Gzip)
  app.use(compression());

  // 4. Global Validation Pipes (DTO Validation)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties not in DTO
    forbidNonWhitelisted: true, // Error if extra properties sent
    transform: true, // Transform payloads to DTO instances
  }));

  // 5. API Prefix
  app.setGlobalPrefix('api');

  // 6. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Saldaña Music API')
    .setDescription('The Saldaña Music API for Split Sheet Management')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('split-sheets')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
