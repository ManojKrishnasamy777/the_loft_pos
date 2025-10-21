import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipientDto {
  @ApiProperty({ example: '919876543210' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: ['John', '20% off'], required: false })
  @IsOptional()
  @IsArray()
  variables?: string[];
}

export class SendBulkMessageDto {
  @ApiProperty({ type: [RecipientDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[];

  @ApiProperty({ example: 'promotional_offer' })
  @IsNotEmpty()
  @IsString()
  templateName: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  languageCode?: string;
}
