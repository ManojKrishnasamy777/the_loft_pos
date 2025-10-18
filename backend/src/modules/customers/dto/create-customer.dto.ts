import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiProperty({ example: '123 Main St, City', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'VIP customer', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'true', required: false })
  @IsOptional()
  isActive?: boolean;
}
