import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';
// Assuming AuthGuard is available or will be implemented. For now, placeholders.
// In a real app, strict AuthGuards are required.

@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) { }

    @Post()
    create(@Body() body: any) { // body: { title, type, upc, userId } - Simplified for demo
        // Ideally use DTOs and decorators
        // For now we assume the user is passed or we stub it
        // In production, @Request() req with JWT payload is used
        return this.catalogService.createCatalog(body.title, { id: body.userId } as any, body.type, body.upc);
    }

    @Post(':id/track')
    addTrack(@Param('id') id: string, @Body() body: any) {
        return this.catalogService.addTrackToCatalog(id, body.title, body.isrc);
    }

    @Get('user/:userId')
    findAll(@Param('userId') userId: string) {
        return this.catalogService.findAllByUser(userId);
    }
}
