import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'order_xyz123' })
  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @ApiProperty({ example: 'pay_abc456' })
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @ApiProperty({ example: 'signature_hash' })
  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;
}