import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '919876543210' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'promotional_offer' })
  @IsNotEmpty()
  @IsString()
  templateName: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  languageCode?: string;

  @ApiProperty({ example: ['John', '20% off'], required: false })
  @IsOptional()
  @IsArray()
  parameters?: string[];
}
