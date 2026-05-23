import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from './create-transaction.dto';

export class UpdateTransactionDto {
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @Expose()
  @IsEnum(TransactionType)
  type!: TransactionType;

  @Expose()
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  transactionItemId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @Expose()
  @Type(() => Date)
  @IsDate()
  transactionDate!: Date;

  @Expose()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @Expose()
  @IsBoolean()
  settled!: boolean;
}
