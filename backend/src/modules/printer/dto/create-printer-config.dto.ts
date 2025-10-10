import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrinterConfigDto {
  @ApiProperty({ example: 'Main Counter Printer' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['EPSON', 'STAR', 'GENERIC'], default: 'EPSON' })
  @IsEnum(['EPSON', 'STAR', 'GENERIC'])
  type: 'EPSON' | 'STAR' | 'GENERIC';

  @ApiProperty({ enum: ['USB', 'NETWORK'], default: 'USB' })
  @IsEnum(['USB', 'NETWORK'])
  interface_type: 'USB' | 'NETWORK';

  @ApiProperty({ required: false, example: 'POS-80' })
  @IsOptional()
  @IsString()
  usb_identifier?: string;

  @ApiProperty({ required: false, example: '192.168.1.100' })
  @IsOptional()
  @IsString()
  network_ip?: string;

  @ApiProperty({ required: false, default: 9100 })
  @IsOptional()
  @IsNumber()
  network_port?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
