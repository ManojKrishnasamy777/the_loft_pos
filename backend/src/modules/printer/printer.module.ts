import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterConfig } from '../../entities/printer_config.entity';
import { PrinterConfigService } from './printer-config.service';
import { ThermalPrintService } from './thermal-print.service';
import { PrinterConfigController } from './printer-config.controller';
import { PrintController } from './print.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PrinterConfig])],
  providers: [PrinterConfigService, ThermalPrintService],
  controllers: [PrinterConfigController, PrintController],
  exports: [PrinterConfigService, ThermalPrintService],
})
export class PrinterModule {}
