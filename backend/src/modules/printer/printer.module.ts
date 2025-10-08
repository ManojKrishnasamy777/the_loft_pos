// src/modules/printer/printer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterConfigService } from './printer-config.service';
import { PrinterConfigController } from './printer-config.controller';
import { PrintService } from './print.service';
import { PrintController } from './print.controller';
import { PrinterConfig } from '../../entities/printer_config.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PrinterConfig])],
    providers: [PrinterConfigService, PrintService],
    controllers: [PrinterConfigController, PrintController],
    exports: [PrinterConfigService],
})
export class PrinterModule { }
