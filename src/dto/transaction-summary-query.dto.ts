import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class TransactionSummaryQueryDto {
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  endDate!: Date;
}
