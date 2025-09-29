import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Beverages', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Hot and cold drinks', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}