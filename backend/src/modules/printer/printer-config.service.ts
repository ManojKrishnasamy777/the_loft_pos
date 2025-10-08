// printer-config.service.ts
import { PrinterConfig } from '../../entities/printer_config.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PrinterConfigService {
    constructor(
        @InjectRepository(PrinterConfig)
        private printerRepo: Repository<PrinterConfig>,
    ) { }


    async getDefaultPrinter() {
        return this.printerRepo.findOne({ where: { is_default: true } });
    }

    async updatePrinterConfig(id: number, data: Partial<PrinterConfig>) {
        await this.printerRepo.update(id, data);
        return this.printerRepo.findOne({ where: { id } });
    }

    async getAllPrinters() {
        return this.printerRepo.find();
    }

    async addPrinter(data: Partial<PrinterConfig>) {
        const printer = this.printerRepo.create(data);
        return this.printerRepo.save(printer);
    }
}
