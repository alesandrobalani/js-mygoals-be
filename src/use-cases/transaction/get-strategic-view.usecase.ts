import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionRepository, StrategicViewTransaction } from '../../domain/repositories/transaction.repository';

@Injectable()
export class GetStrategicViewUseCase {
  private readonly logger = new Logger(GetStrategicViewUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(startDate: Date, endDate: Date): Promise<StrategicViewTransaction[]> {
    this.logger.log(
      `Retrieving strategic view from ${startDate} to ${endDate}`,
      'GetStrategicViewUseCase',
    );

    try {
      const transactions = await this.transactionRepository.findAllByPeriod(startDate, endDate);


      const result: StrategicViewTransaction[] = 
      transactions
      .filter(t => t.category.isTransfer === false)
      .map(t => ({
        amount: t.amount,
        type: t.type,
        categoryName: t.category.name,
        itemName: t.transactionItem.name,
        transactionDate: t.transactionDate,
        dueDate: t.dueDate,
        settled: t.settled,
      }));

      this.logger.log(`Found ${result.length} transactions for strategic view`, 'GetStrategicViewUseCase');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve strategic view: ${errorMessage}`, errorStack, 'GetStrategicViewUseCase');
      throw error;
    }
  }
}
