import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @IsNumber()
  @Min(0.01)
  readonly amount!: number;

  @IsEnum(TransactionType)
  readonly type!: TransactionType;

  @IsEnum(TransactionCategory)
  readonly category!: TransactionCategory;

  @IsDate()
  readonly transactionDate!: Date;

  @IsOptional()
  @IsDate()
  readonly dueDate?: Date;

  @IsString()
  @IsNotEmpty()
  readonly account!: string;
}
