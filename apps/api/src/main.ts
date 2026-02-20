import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers (Helmet)
  // 1. Security Headers (Helmet)
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'unsafe-none' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: true, // Re-enabled since Google Scripts are removed
    }),
  );

  // Enable Trust Proxy for Load Balancers (Traefik/Nginx)
  try {
    const instance = app.getHttpAdapter().getInstance() as unknown;
    const maybeExpress = instance as { set?: unknown };
    if (typeof maybeExpress.set === 'function') {
      (maybeExpress.set as (key: string, value: unknown) => void)(
        'trust proxy',
        1,
      );
    }
  } catch (error: unknown) {
    console.warn(
      'Failed to set trust proxy:',
      error instanceof Error ? error.message : String(error),
    );
  }

  // 2. CORS (Restricted to specific domains)
  app.enableCors({
    origin: [
      'https://app.saldanamusic.com',
      'https://saldanamusic.com',
      'https://www.saldanamusic.com',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  });

  // 3. Compression (Gzip)
  app.use(compression());

  // 4. Global Validation Pipes (DTO Validation)
  // 4. Global Validation Pipes & Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable Global Serialization (for @Exclude) and Logging
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new LoggingInterceptor(),
  );

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

  const logger = new Logger('Bootstrap');
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Failed to start application',
    error instanceof Error ? error.stack : String(error),
  );
});
