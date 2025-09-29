import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditFilterDto {
  @ApiProperty({ example: 'uuid-of-user', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'CREATE', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ example: 'order', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ example: '2024-01-31', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}