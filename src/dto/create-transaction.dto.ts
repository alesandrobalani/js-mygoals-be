import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateTransactionDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  description!: string;

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
  transactionDate!: Date;

  @Expose()
  @IsOptional()
  dueDate?: Date;
}
