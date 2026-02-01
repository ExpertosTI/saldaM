import { Controller, Post, Body, Get, UseGuards, Req, Param } from '@nestjs/common';
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
}
