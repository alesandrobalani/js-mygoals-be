import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTransactionItemDto {
  @Expose()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}
