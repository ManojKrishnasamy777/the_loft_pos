import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john@theloftscreening.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'newpassword123', required: false })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'uuid-of-role', required: false })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}