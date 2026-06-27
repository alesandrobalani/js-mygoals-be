import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTransferTransactionDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  debitAccountId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  creditAccountId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  transactionItemId!: string;

  @Expose()
  @Type(() => Date)
  @IsDate()
  transactionDate!: Date;

  @Expose()
  @Type(() => Date)
  @IsDate()
  dueDate!: Date;

  @Expose()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @Expose()
  @IsBoolean()
  settled!: boolean;
}
