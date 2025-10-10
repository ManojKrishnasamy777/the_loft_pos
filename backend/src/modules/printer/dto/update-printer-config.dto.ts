import { PartialType } from '@nestjs/swagger';
import { CreatePrinterConfigDto } from './create-printer-config.dto';

export class UpdatePrinterConfigDto extends PartialType(CreatePrinterConfigDto) {}
