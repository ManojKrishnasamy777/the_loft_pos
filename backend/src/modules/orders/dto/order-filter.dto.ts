import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentMethod } from '../../../entities/order.entity';

export class OrderFilterDto {
  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ example: '2024-01-31', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({ example: 'ORD-20240101-001', required: false })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}