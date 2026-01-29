
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SplitSheet } from './entities/split-sheet.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SplitSheetService {
    constructor(
        @InjectRepository(SplitSheet)
        private splitSheetRepository: Repository<SplitSheet>,
    ) { }

    async create(createSplitSheetDto: any) {
        // Note: In a real auth scenario, we would attach the "owner" here.
        // For MVP/Demo if no user is authenticated, we might need a workaround or ensure a valid user is passed.
        // Assuming the DTO comes with all data.

        const splitSheet = this.splitSheetRepository.create(createSplitSheetDto);
        return this.splitSheetRepository.save(splitSheet);
    }

    findAll() {
        return this.splitSheetRepository.find({ relations: ['collaborators'] });
    }

    findOne(id: string) {
        return this.splitSheetRepository.findOne({ where: { id }, relations: ['collaborators'] });
    }
}
