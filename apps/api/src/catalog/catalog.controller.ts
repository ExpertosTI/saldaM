import { Controller, Post, Body, Get, Delete, Patch, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() body: any, @Req() req: any) {
        return this.catalogService.createCatalog(body.title, req.user, body.type, body.upc);
    }

    @Post(':id/track')
    @UseGuards(AuthGuard('jwt'))
    addTrack(@Param('id') id: string, @Body() body: any) {
        return this.catalogService.addTrackToCatalog(id, body.title, body.isrc);
    }

    @Get('mine')
    @UseGuards(AuthGuard('jwt'))
    findMine(@Req() req: any) {
        return this.catalogService.findAllByUser(req.user.id);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.catalogService.findOne(id, req.user.id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    deleteCatalog(@Param('id') id: string, @Req() req: any) {
        return this.catalogService.deleteCatalog(id, req.user.id);
    }

    @Patch('track/:trackId')
    @UseGuards(AuthGuard('jwt'))
    updateTrack(@Param('trackId') trackId: string, @Req() req: any, @Body() body: { title?: string; isrc?: string }) {
        return this.catalogService.updateTrack(trackId, req.user.id, body);
    }
}
