import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsEmail, IsUUID } from 'class-validator';
import { OrderStatus } from '../../../entities/order.entity';

export class UpdateOrderDto {
  @ApiProperty({ example: '9f8c7b6a-1234-4abc-9def-1234567890ab', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string | null;

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

  @ApiProperty({ example: 'SCREEN-1', required: false })
  @IsOptional()
  @IsString()
  screenId?: string;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  metadata?: any;

  @ApiProperty({
    example: 'Customer requested extra cheese and gift wrapping.',
    required: false,
    description: 'Optional notes about the customer or order'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
