import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Query } from '@nestjs/common';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { TransactionSummaryQueryDto as TransactionPeriodDto } from '../../dto/transaction-summary-query.dto';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';
import { GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase } from '../../use-cases/transaction/get-transactions-summary-by-period.usecase';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';

@Roles(UserRole.USER)
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransactions: GetTransactionsUseCase,
    private readonly getTransactionsSummaryByPeriod: GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateTransactionDto) {
    this.logger.log(`POST /transactions - Creating transaction: ${payload.description}`, 'TransactionsController');

    try {
      const result = await this.createTransaction.execute(payload);
      this.logger.log(`Transaction created successfully: ${result.id}`, 'TransactionsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create transaction: ${errorMessage}`, errorStack, 'TransactionsController');
      throw error;
    }
  }

  @Get('summary')
  async getSummary(@Query() query: TransactionPeriodDto) {
    this.logger.log(`GET /transactions/summary - startDate=${query.startDate}, endDate=${query.endDate}`, 'TransactionsController');

    try {
      const result = await this.getTransactionsSummaryByPeriod.execute(query.startDate, query.endDate);
      this.logger.log(`Summary retrieved: income=${result.income}, expense=${result.expense}`, 'TransactionsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve summary: ${errorMessage}`, errorStack, 'TransactionsController');
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
