import { Body, Controller, Get, Post, Logger } from '@nestjs/common';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';

@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransactions: GetTransactionsUseCase,
  ) {}

  @Post()
  async create(@Body() payload: any) {
    this.logger.log(`POST /transactions - Creating transaction: ${payload.description}`, 'TransactionsController');

    // Convert date strings to Date objects
    const processedPayload = {
      ...payload,
      transactionDate: new Date(payload.transactionDate),
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
    };

    try {
      const result = await this.createTransaction.execute(processedPayload);
      this.logger.log(`Transaction created successfully: ${result.id}`, 'TransactionsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create transaction: ${errorMessage}`, errorStack, 'TransactionsController');
      throw error;
    }
  }

  @Get()
  async findAll() {
    this.logger.log('GET /transactions - Retrieving all transactions', 'TransactionsController');

    try {
      const transactions = await this.getTransactions.execute();
      this.logger.log(`Retrieved ${transactions.length} transactions`, 'TransactionsController');
      return transactions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transactions: ${errorMessage}`, errorStack, 'TransactionsController');
      throw error;
    }
  }
}
