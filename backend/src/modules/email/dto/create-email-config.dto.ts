import { IsString, IsNumber, IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class CreateEmailConfigDto {
  @IsString()
  smtpHost: string;

  @IsNumber()
  smtpPort: number;

  @IsString()
  smtpUser: string;

  @IsString()
  smtpPassword: string;

  @IsEmail()
  fromEmail: string;

  @IsString()
  fromName: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsBoolean()
  isEnabled: boolean;

  @IsOptional()
  @IsString()
  userId?: string;
}
