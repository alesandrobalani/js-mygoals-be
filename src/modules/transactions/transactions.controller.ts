import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../dto/update-transaction.dto';
import { TransactionSummaryQueryDto as TransactionPeriodDto } from '../../dto/transaction-summary-query.dto';
import { FindTransactionsByPeriodDto } from '../../dto/find-transactions-by-period.dto';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { UpdateTransactionUseCase } from '../../use-cases/transaction/update-transaction.usecase';
import { GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase } from '../../use-cases/transaction/get-transactions-summary-by-period.usecase';
import { FindTransactionsByPeriodUseCase } from '../../use-cases/transaction/find-transactions-by-period.usecase';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';
import { GetTransactionsSummaryByAccountByTransactionTypeUseCase } from '../../use-cases/transaction/get-transactions-summary-by-account.usecase';

@Roles(UserRole.USER)
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly updateTransaction: UpdateTransactionUseCase,
    private readonly getTransactionsSummaryByPeriod: GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase,
    private readonly findTransactionsByPeriod: FindTransactionsByPeriodUseCase,
    private readonly getTransactionsSummaryByAccount: GetTransactionsSummaryByAccountByTransactionTypeUseCase,
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

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateTransactionDto) {
    this.logger.log(`PUT /transactions/${id} - Updating transaction`, 'TransactionsController');

    try {
      const result = await this.updateTransaction.execute({ id, ...payload });
      this.logger.log(`Transaction updated successfully: ${result.id}`, 'TransactionsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update transaction: ${errorMessage}`, errorStack, 'TransactionsController');
      throw error;
    }
  }

  @Get('summary')
  async getSummary(@Query() query: TransactionPeriodDto) {
    this.logger.log(`GET /transactions/summary - startDate=${query.startDate}, endDate=${query.endDate}`, 'TransactionsController');

    try {
      const result = await this.getTransactionsSummaryByPeriod.execute(query.startDate, query.endDate);
      this.logger.log(`Summary retrieved: incomeSettled=${result.incomeSettled}, incomeNotSettled=${result.incomeNotSettled}, expenseSettled=${result.expenseSettled}, expenseNotSettled=${result.expenseNotSettled}`, 'TransactionsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve summary: ${errorMessage}`, errorStack, 'TransactionsController');
      throw error;
    }
  }

  @Get('search')
  async search(@Query() query: FindTransactionsByPeriodDto) {
    this.logger.log(
      `GET /transactions/search - startDate=${query.startDate}, endDate=${query.endDate}, page=${query.page}, limit=${query.limit}`,
      'TransactionsController',
    );

    try {
      const result = await this.findTransactionsByPeriod.execute(query.startDate, query.endDate, query.page, query.limit);
      this.logger.log(`Found ${result.total} transactions (page ${result.page}/${result.totalPages})`, 'TransactionsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to search transactions: ${errorMessage}`, errorStack, 'TransactionsController');
      throw error;
    }
  }

  @Get('summaryByAccount')
  async getSummaryByAccount(@Query() { endDate }: { endDate: Date }) {
    this.logger.log(`GET /transactions/summaryByAccount - endDate=${endDate}`, 'TransactionsController');

    try {
      const result = await this.getTransactionsSummaryByAccount.execute(endDate);
      this.logger.log(`Summary by account retrieved: ${JSON.stringify(result)}`, 'TransactionsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve summary by account: ${errorMessage}`, errorStack, 'TransactionsController');
      throw error;
    }
  }      

}
