import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: 'The Loft Coimbatore', required: false })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ example: 'Company name for invoices', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}