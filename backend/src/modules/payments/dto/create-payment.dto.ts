import { PaymentMethod } from '../../../Enum/paymentmethodEnum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-of-order' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 'order_xyz123', required: false })
  @IsOptional()
  @IsString()
  gatewayOrderId?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  gatewayResponse?: any;
}