import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransactions: GetTransactionsUseCase,
  ) {}

  @Post()
  create(@Body() payload: CreateTransactionDto) {
    return this.createTransaction.execute(payload);
  }

  @Get()
  findAll() {
    return this.getTransactions.execute();
  }
}
