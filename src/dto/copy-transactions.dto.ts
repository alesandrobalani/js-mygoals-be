import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { TransactionType } from './create-transaction.dto';

export const COPY_MAX_TRANSACTION_IDS = 500;
export const COPY_MAX_TARGET_MONTHS = 24;

export class CopyTransactionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(COPY_MAX_TRANSACTION_IDS)
  @ArrayUnique({ message: 'transactionIds must not contain duplicates' })
  @IsUUID('all', { each: true })
  transactionIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(COPY_MAX_TARGET_MONTHS)
  @ArrayUnique({ message: 'targetMonths must not contain duplicates' })
  @IsString({ each: true })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { each: true, message: 'each value in targetMonths must be in YYYY-MM format' })
  targetMonths!: string[];

  // A conversão implícita do ValidationPipe transformaria qualquer string em `true`;
  // aqui recuperamos o valor bruto para que apenas booleanos sejam aceitos.
  @IsOptional()
  @Transform(({ obj }) => (obj as Record<string, unknown>).dryRun)
  @IsBoolean()
  dryRun?: boolean;
}

export interface CopyTransactionsCreatedItem {
  sourceId: string;
  targetMonth: string;
  description: string | undefined;
  amount: number;
  type: TransactionType;
  dueDate: string;
  transactionDate: string;
}

export interface CopyTransactionsSkippedItem {
  sourceId: string;
  targetMonth: string;
  dueDate: string;
  reason: 'duplicate';
}

export interface CopyTransactionsResult {
  dryRun: boolean;
  created: CopyTransactionsCreatedItem[];
  skipped: CopyTransactionsSkippedItem[];
}
