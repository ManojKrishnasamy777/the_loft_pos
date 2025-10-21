import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Addon } from '../../entities/addon.entity';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';

@Injectable()
export class AddonsService {
  constructor(
    @InjectRepository(Addon)
    private addonRepository: Repository<Addon>,
  ) {}

  async create(createAddonDto: CreateAddonDto): Promise<Addon> {
    const addon = this.addonRepository.create(createAddonDto);
    return await this.addonRepository.save(addon);
  }

  async findAll(): Promise<Addon[]> {
    return await this.addonRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<Addon[]> {
    return await this.addonRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Addon> {
    const addon = await this.addonRepository.findOne({ where: { id } });
    if (!addon) {
      throw new NotFoundException(`Addon with ID ${id} not found`);
    }
    return addon;
  }

  async update(id: string, updateAddonDto: UpdateAddonDto): Promise<Addon> {
    const addon = await this.findOne(id);
    Object.assign(addon, updateAddonDto);
    return await this.addonRepository.save(addon);
  }

  async remove(id: string): Promise<void> {
    const addon = await this.findOne(id);
    await this.addonRepository.remove(addon);
  }
}
