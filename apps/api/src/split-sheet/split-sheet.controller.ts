import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.splitSheetService.findOne(id);
    }

    @Get(':id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: Response) {
        const pdfBuffer = await this.splitSheetService.downloadPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="split-sheet-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
}
