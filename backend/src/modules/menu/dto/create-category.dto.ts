import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Beverages' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Hot and cold drinks' })
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