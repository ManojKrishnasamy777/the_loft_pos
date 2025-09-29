import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { OrderStatus } from '../../../entities/order.entity';

export class UpdateOrderDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  metadata?: any;
}