import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFileImportDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  importIdentifier!: string;

  @Expose()
  @IsOptional()
  @IsString()
  password?: string;
}
