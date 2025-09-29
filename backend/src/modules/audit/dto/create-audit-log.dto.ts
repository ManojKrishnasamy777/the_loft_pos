import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'CREATE' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ example: 'order' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'uuid-of-resource', required: false })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  oldValues?: any;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  newValues?: any;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;
}