import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSettingDto {
  @ApiProperty({ example: 'company_name' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ example: 'The Loft Coimbatore' })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiProperty({ example: 'Company name for invoices', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}