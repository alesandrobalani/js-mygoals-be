import { Body, Controller, Delete, Get, Param, Post, Put, Logger } from '@nestjs/common';
import { CreateTransactionItemDto } from '../../dto/create-transaction-item.dto';
import { UpdateTransactionItemDto } from '../../dto/update-transaction-item.dto';
import { CreateTransactionItemUseCase } from '../../use-cases/transaction-item/create-transaction-item.usecase';
import { GetTransactionItemsUseCase } from '../../use-cases/transaction-item/get-transaction-items.usecase';
import { GetTransactionItemUseCase } from '../../use-cases/transaction-item/get-transaction-item.usecase';
import { UpdateTransactionItemUseCase } from '../../use-cases/transaction-item/update-transaction-item.usecase';
import { DeleteTransactionItemUseCase } from '../../use-cases/transaction-item/delete-transaction-item.usecase';

@Controller('transaction-items')
export class TransactionItemsController {
  private readonly logger = new Logger(TransactionItemsController.name);

  constructor(
    private readonly createTransactionItem: CreateTransactionItemUseCase,
    private readonly getTransactionItems: GetTransactionItemsUseCase,
    private readonly getTransactionItem: GetTransactionItemUseCase,
    private readonly updateTransactionItem: UpdateTransactionItemUseCase,
    private readonly deleteTransactionItem: DeleteTransactionItemUseCase,
  ) {}

  @Post()
  async create(@Body() payload: CreateTransactionItemDto) {
    this.logger.log(`POST /transaction-items - Creating item: ${payload.name}`, 'TransactionItemsController');
    return this.createTransactionItem.execute(payload);
  }

  @Get()
  async findAll() {
    this.logger.log('GET /transaction-items - Retrieving all transaction items', 'TransactionItemsController');
    return this.getTransactionItems.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /transaction-items/${id} - Retrieving transaction item`, 'TransactionItemsController');
    return this.getTransactionItem.execute(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateTransactionItemDto) {
    this.logger.log(`PUT /transaction-items/${id} - Updating transaction item`, 'TransactionItemsController');
    return this.updateTransactionItem.execute(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`DELETE /transaction-items/${id} - Removing transaction item`, 'TransactionItemsController');
    return this.deleteTransactionItem.execute(id);
  }
}
