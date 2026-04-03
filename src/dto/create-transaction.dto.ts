import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @IsNumber()
  @Min(0.01)
  readonly amount!: number;

  @IsEnum(TransactionType)
  readonly type!: TransactionType;

  @IsString()
  @IsNotEmpty()
  readonly category!: string;
}
