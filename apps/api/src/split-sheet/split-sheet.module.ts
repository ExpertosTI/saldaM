import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SplitSheetService } from './split-sheet.service';
import { SplitSheetController } from './split-sheet.controller';
import { SplitSheet } from './entities/split-sheet.entity';
import { Collaborator } from './entities/collaborator.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SplitSheet, Collaborator])],
    controllers: [SplitSheetController],
    providers: [SplitSheetService],
})
export class SplitSheetModule { }
