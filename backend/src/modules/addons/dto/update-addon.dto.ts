import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateAddonDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
