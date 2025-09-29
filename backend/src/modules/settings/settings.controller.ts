import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @ApiOperation({ summary: 'Get setting by key' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @ApiOperation({ summary: 'Create new setting' })
  @ApiResponse({ status: 201, description: 'Setting created successfully' })
  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @ApiOperation({ summary: 'Update setting' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  @Patch(':key')
  update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @ApiOperation({ summary: 'Delete setting' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }

  @ApiOperation({ summary: 'Initialize default settings' })
  @ApiResponse({ status: 200, description: 'Default settings initialized' })
  @Post('initialize')
  initializeDefaults() {
    return this.settingsService.initializeDefaultSettings();
  }
}