import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiptItemDto {
  @ApiProperty({ example: 'Cappuccino' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  price: number;
}

export class PrintReceiptDto {
  @ApiProperty({ example: 'The Loft Coimbatore' })
  @IsString()
  storeName: string;

  @ApiProperty({ example: 'Coimbatore, Tamil Nadu' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'ORD-001' })
  @IsString()
  orderNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  customerName: string;

  @ApiProperty({ type: [ReceiptItemDto] })
  @IsArray()
  items: ReceiptItemDto[];

  @ApiProperty({ example: 300 })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ example: 54 })
  @IsNumber()
  tax: number;

  @ApiProperty({ example: 354 })
  @IsNumber()
  total: number;

  @ApiProperty({ example: 'Cash' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ required: false, example: 'ORD-001' })
  @IsOptional()
  @IsString()
  qrCode?: string;
}
