import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  HABITACAO = 'Habitação',
  SERVICOS_PUBLICOS = 'Serviços públicos',
  EDUCACAO = 'Educação',
  SAUDE = 'Saúde',
  ALIMENTACAO = 'Alimentação',
  TRANSPORTE = 'Transporte',
  LAZER = 'Lazer',
  CUIDADOS_PESSOAIS = 'Cuidados pessoais',
  RENDA_ATIVA = 'Renda Ativa',
  RENDA_EXTRA = 'Renda extra',
  RENDA_PASSIVA = 'Renda passiva',
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
  @IsEnum(TransactionCategory)
  category!: TransactionCategory;

  @Expose()
  transactionDate!: Date;

  @Expose()
  @IsOptional()
  dueDate?: Date;

  @Expose()
  @IsString()
  @IsNotEmpty()
  account!: string;
}
