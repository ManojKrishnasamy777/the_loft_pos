import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrinterConfigService } from './printer-config.service';
import { CreatePrinterConfigDto } from './dto/create-printer-config.dto';
import { UpdatePrinterConfigDto } from './dto/update-printer-config.dto';

@ApiTags('Printer Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/printer-config')
export class PrinterConfigController {
  constructor(private readonly printerConfigService: PrinterConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Create new printer configuration' })
  create(@Body() createDto: CreatePrinterConfigDto) {
    return this.printerConfigService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all printer configurations' })
  findAll() {
    return this.printerConfigService.findAll();
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default printer configuration' })
  findDefault() {
    return this.printerConfigService.findDefault();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get printer configuration by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.printerConfigService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update printer configuration' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePrinterConfigDto,
  ) {
    return this.printerConfigService.update(id, updateDto);
  }

  @Put(':id/set-default')
  @ApiOperation({ summary: 'Set printer as default' })
  setDefault(@Param('id', ParseIntPipe) id: number) {
    return this.printerConfigService.setDefault(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete printer configuration' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.printerConfigService.remove(id);
  }
}
