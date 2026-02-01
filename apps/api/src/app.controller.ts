import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'saldana-music-api',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
