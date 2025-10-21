import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateAddonDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
