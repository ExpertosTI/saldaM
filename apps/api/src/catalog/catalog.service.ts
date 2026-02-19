import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { Track } from './entities/track.entity';
import type { User } from '../user/entities/user.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
  ) {}

  async createCatalog(
    title: string,
    userId: string,
    type?: string,
    upc?: string,
  ) {
    const catalog = this.catalogRepository.create({
      title,
      owner: { id: userId } as User,
      type,
      upc,
    });
    return this.catalogRepository.save(catalog);
  }

  async addTrackToCatalog(catalogId: string, title: string, isrc?: string) {
    const catalog = await this.catalogRepository.findOne({
      where: { id: catalogId },
    });
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

  async findOne(id: string, userId: string) {
    const catalog = await this.catalogRepository.findOne({
      where: { id },
      relations: ['tracks', 'owner'],
    });
    if (!catalog) throw new Error('Catalog not found');
    if (catalog.owner?.id !== userId) {
      throw new Error('Unauthorized: You do not own this catalog');
    }
    return catalog;
  }

  async deleteCatalog(id: string, userId: string) {
    const catalog = await this.catalogRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!catalog) throw new Error('Catalog not found');
    if (catalog.owner?.id !== userId) {
      throw new Error('Unauthorized: You do not own this catalog');
    }
    await this.catalogRepository.remove(catalog);
    return { message: 'Catalog deleted successfully' };
  }

  async updateTrack(
    trackId: string,
    userId: string,
    data: { title?: string; isrc?: string },
  ) {
    const track = await this.trackRepository.findOne({
      where: { id: trackId },
      relations: ['catalog', 'catalog.owner'],
    });
    if (!track) throw new Error('Track not found');
    if (track.catalog?.owner?.id !== userId) {
      throw new Error('Unauthorized: You do not own this track');
    }
    if (data.title) track.title = data.title;
    if (data.isrc) track.isrc = data.isrc;
    return this.trackRepository.save(track);
  }
}
