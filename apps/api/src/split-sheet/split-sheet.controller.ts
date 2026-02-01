import { Controller, Get, Post, Body, Param, Res, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { SplitSheetService } from './split-sheet.service';

@Controller('split-sheets')
export class SplitSheetController {
    constructor(private readonly splitSheetService: SplitSheetService) { }

    @Post()
    create(@Body() createSplitSheetDto: any) {
        return this.splitSheetService.create(createSplitSheetDto);
    }

    @Get()
    findAll() {
        return this.splitSheetService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.splitSheetService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.splitSheetService.findOne(id);
    }

    @Get(':id/pdf')
    @UseGuards(AuthGuard('jwt'))
    async downloadPdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
        const user = req.user;
        const pdfBuffer = await this.splitSheetService.downloadPdf(id, user); // Pass user for auth check
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="split-sheet-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
    @Post(':id/invite')
    @UseGuards(AuthGuard('jwt'))
    async generateInvite(@Param('id') id: string, @Req() req: any) {
        const token = await this.splitSheetService.generateInvite(id, req.user);
        return { token, url: `https://app.saldanamusic.com/join/${token}` };
    }

    @Post('join/:token')
    @UseGuards(AuthGuard('jwt'))
    async joinViaInvite(@Param('token') token: string, @Req() req: any) {
        return this.splitSheetService.joinViaInvite(token, req.user);
    }

    @Post(':id/start-signatures')
    @UseGuards(AuthGuard('jwt'))
    async startSignatures(@Param('id') id: string, @Req() req: any) {
        return this.splitSheetService.startSignatures(id, req.user);
    }

    @Post(':id/sign')
    @UseGuards(AuthGuard('jwt'))
    async sign(@Param('id') id: string, @Req() req: any) {
        return this.splitSheetService.sign(id, req.user);
    }
}
