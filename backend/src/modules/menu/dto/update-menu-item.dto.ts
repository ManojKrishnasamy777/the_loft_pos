import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID, IsBoolean, Min, Max } from 'class-validator';

export class UpdateMenuItemDto {
  @ApiProperty({ example: 'Masala Chai', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Traditional Indian spiced tea', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 'uuid-of-category', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 0.18, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}