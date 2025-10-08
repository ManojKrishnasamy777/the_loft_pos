// printer-config.controller.ts
import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { PrinterConfigService } from './printer-config.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('printer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('printer')
export class PrinterConfigController {
    constructor(private printerService: PrinterConfigService) { }

    @Get()
    getAll() {
        return this.printerService.getAllPrinters();
    }

    @Post()
    addPrinter(@Body() data: any) {
        return this.printerService.addPrinter(data);
    }

    @Put(':id')
    updatePrinter(@Param('id') id: number, @Body() data: any) {
        return this.printerService.updatePrinterConfig(id, data);
    }
}
