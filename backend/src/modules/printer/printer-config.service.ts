import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrinterConfig } from '../../entities/printer_config.entity';
import { CreatePrinterConfigDto } from './dto/create-printer-config.dto';
import { UpdatePrinterConfigDto } from './dto/update-printer-config.dto';

@Injectable()
export class PrinterConfigService {
  constructor(
    @InjectRepository(PrinterConfig)
    private printerRepo: Repository<PrinterConfig>,
  ) {}

  async create(createDto: CreatePrinterConfigDto): Promise<PrinterConfig> {
    if (createDto.is_default) {
      await this.printerRepo.update({}, { is_default: false });
    }

    const printer = this.printerRepo.create(createDto);
    return this.printerRepo.save(printer);
  }

  async findAll(): Promise<PrinterConfig[]> {
    return this.printerRepo.find({ order: { is_default: 'DESC', id: 'ASC' } });
  }

  async findOne(id: number): Promise<PrinterConfig> {
    const printer = await this.printerRepo.findOne({ where: { id } });
    if (!printer) {
      throw new NotFoundException(`Printer with ID ${id} not found`);
    }
    return printer;
  }

  async findDefault(): Promise<PrinterConfig> {
    const printer = await this.printerRepo.findOne({ where: { is_default: true } });
    if (!printer) {
      throw new NotFoundException('No default printer configured');
    }
    return printer;
  }

  async update(id: number, updateDto: UpdatePrinterConfigDto): Promise<PrinterConfig> {
    const printer = await this.findOne(id);

    if (updateDto.is_default) {
      await this.printerRepo.update({}, { is_default: false });
    }

    Object.assign(printer, updateDto);
    return this.printerRepo.save(printer);
  }

  async remove(id: number): Promise<void> {
    const printer = await this.findOne(id);
    await this.printerRepo.remove(printer);
  }

  async setDefault(id: number): Promise<PrinterConfig> {
    await this.printerRepo.update({}, { is_default: false });
    await this.printerRepo.update({ id }, { is_default: true });
    return this.findOne(id);
  }
}
