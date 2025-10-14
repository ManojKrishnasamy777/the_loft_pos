import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddonsService } from './addons.service';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';

@Controller('api/addons')
@UseGuards(JwtAuthGuard)
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Post()
  create(@Body() createAddonDto: CreateAddonDto) {
    return this.addonsService.create(createAddonDto);
  }

  @Get()
  findAll() {
    return this.addonsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.addonsService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addonsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAddonDto: UpdateAddonDto) {
    return this.addonsService.update(id, updateAddonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addonsService.remove(id);
  }
}
