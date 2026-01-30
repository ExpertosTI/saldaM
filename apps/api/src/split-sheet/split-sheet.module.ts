import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SplitSheetService } from './split-sheet.service';
import { SplitSheetController } from './split-sheet.controller';
import { SplitSheet } from './entities/split-sheet.entity';
import { Collaborator } from './entities/collaborator.entity';
import { SignatureModule } from '../signature/signature.module';

@Module({
    imports: [TypeOrmModule.forFeature([SplitSheet, Collaborator]), SignatureModule],
    controllers: [SplitSheetController],
    providers: [SplitSheetService],
})
export class SplitSheetModule { }
