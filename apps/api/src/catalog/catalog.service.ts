import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { Track } from './entities/track.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Catalog)
        private catalogRepository: Repository<Catalog>,
        @InjectRepository(Track)
        private trackRepository: Repository<Track>,
    ) { }

    async createCatalog(title: string, user: User, type?: string, upc?: string) {
        const catalog = this.catalogRepository.create({
            title,
            owner: user,
            type,
            upc,
        });
        return this.catalogRepository.save(catalog);
    }

    async addTrackToCatalog(catalogId: string, title: string, isrc?: string) {
        const catalog = await this.catalogRepository.findOne({ where: { id: catalogId } });
        if (!catalog) throw new Error('Catalog not found');

        const track = this.trackRepository.create({
            title,
            isrc,
            catalog,
        });
        return this.trackRepository.save(track);
    }

    async findAllByUser(userId: string) {
        return this.catalogRepository.find({
            where: { owner: { id: userId } },
            relations: ['tracks'],
        });
    }
}
