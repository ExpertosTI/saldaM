import { Controller, Get, Post, Delete, Body, Param, Res, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { SplitSheetService } from './split-sheet.service';

@Controller('split-sheets')
export class SplitSheetController {
    constructor(private readonly splitSheetService: SplitSheetService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createSplitSheetDto: any, @Req() req: any) {
        return this.splitSheetService.create(createSplitSheetDto, req.user);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll(@Req() req: any) {
        return this.splitSheetService.findAllByUser(req.user.id);
    }

    @Get('stats')
    getStats() {
        return this.splitSheetService.getStats();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any) {
        return this.splitSheetService.findOne(id, req.user);
    }

    @Get(':id/pdf')
    @UseGuards(AuthGuard('jwt'))
    async downloadPdf(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any, @Res() res: Response) {
        const user = req.user;
        const pdfBuffer = await this.splitSheetService.downloadPdf(id, user); // Pass user for auth check
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="split-sheet-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }

    @Get(':id/full-pdf')
    @UseGuards(AuthGuard('jwt'))
    async downloadFullPdf(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any, @Res() res: Response) {
        const user = req.user;
        const pdfBuffer = await this.splitSheetService.downloadFullPdf(id, user);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="full-split-sheet-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
    @Post(':id/invite')
    @UseGuards(AuthGuard('jwt'))
    async generateInvite(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any) {
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
    async startSignatures(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any) {
        return this.splitSheetService.startSignatures(id, req.user);
    }

    @Post(':id/sign')
    @UseGuards(AuthGuard('jwt'))
    async sign(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any) {
        return this.splitSheetService.sign(id, req.user);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async deleteSplitSheet(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any) {
        return this.splitSheetService.deleteSplitSheet(id, req.user);
    }

    @Post(':id/collaborator')
    @UseGuards(AuthGuard('jwt'))
    async addCollaborator(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any, @Body() body: { email: string; legalName: string; role: string; percentage: number }) {
        return this.splitSheetService.addCollaborator(id, req.user, body as any);
    }

    @Delete(':id/collaborator/:email')
    @UseGuards(AuthGuard('jwt'))
    async removeCollaborator(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('email') email: string, @Req() req: any) {
        return this.splitSheetService.removeCollaborator(id, req.user, email);
    }
}
