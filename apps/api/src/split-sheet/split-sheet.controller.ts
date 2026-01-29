import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
}
