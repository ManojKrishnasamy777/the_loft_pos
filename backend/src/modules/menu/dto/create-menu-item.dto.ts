import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsUUID, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Masala Chai' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Traditional Indian spiced tea' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 0.18 })
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