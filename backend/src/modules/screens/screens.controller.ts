import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { ScreensService } from './screens.service';
import { CreateScreenDto, UpdateScreenDto } from './dto/screens.dto';
import { Screens } from '@/entities/screens.entity';


@Controller('screens')
export class ScreensController {
    constructor(private readonly screensService: ScreensService) { }

    @Post()
    async create(@Body() createScreenDto: CreateScreenDto): Promise<Screens> {
        return this.screensService.create(createScreenDto);
    }

    @Get()
    async findAll(): Promise<Screens[]> {
        return this.screensService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Screens> {
        return this.screensService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateScreenDto: UpdateScreenDto,
    ): Promise<Screens> {
        return this.screensService.update(id, updateScreenDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        await this.screensService.remove(id);
        return { message: 'Screen deleted successfully' };
    }
}
