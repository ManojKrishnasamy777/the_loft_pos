import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Screens } from '@/entities/screens.entity';
import { CreateScreenDto, UpdateScreenDto } from './dto/screens.dto';

@Injectable()
export class ScreensService {
    constructor(
        @InjectRepository(Screens)
        private readonly screensRepository: Repository<Screens>,
    ) { }

    async create(createScreenDto: CreateScreenDto): Promise<Screens> {
        const screen = this.screensRepository.create(createScreenDto);
        return await this.screensRepository.save(screen);
    }

    async findAll(): Promise<Screens[]> {
        return await this.screensRepository.find();
    }

    async findOne(id: string): Promise<Screens> {
        const screen = await this.screensRepository.findOne({ where: { id } });
        if (!screen) throw new NotFoundException(`Screen with ID ${id} not found`);
        return screen;
    }

    async update(id: string, updateScreenDto: UpdateScreenDto): Promise<Screens> {
        const screen = await this.findOne(id);
        Object.assign(screen, updateScreenDto);
        return await this.screensRepository.save(screen);
    }

    async remove(id: string): Promise<void> {
        const result = await this.screensRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Screen with ID ${id} not found`);
        }
    }
}
