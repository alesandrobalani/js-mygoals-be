import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CreateTransactionItemDto } from '../../dto/create-transaction-item.dto';
import { UpdateTransactionItemDto } from '../../dto/update-transaction-item.dto';
import { CreateTransactionItemUseCase } from '../../use-cases/transaction-item/create-transaction-item.usecase';
import { GetTransactionItemsUseCase } from '../../use-cases/transaction-item/get-transaction-items.usecase';
import { GetTransactionItemUseCase } from '../../use-cases/transaction-item/get-transaction-item.usecase';
import { UpdateTransactionItemUseCase } from '../../use-cases/transaction-item/update-transaction-item.usecase';
import { DeleteTransactionItemUseCase } from '../../use-cases/transaction-item/delete-transaction-item.usecase';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';

@Roles(UserRole.USER)
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateTransactionItemDto) {
    this.logger.log(`POST /transaction-items - Creating item: ${payload.name}`, 'TransactionItemsController');

    try {
      const result = await this.createTransactionItem.execute(payload);
      this.logger.log(`Transaction item created successfully: ${result.id}`, 'TransactionItemsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create transaction item: ${errorMessage}`, errorStack, 'TransactionItemsController');
      throw error;
    }
  }

  @Get()
  async findAll() {
    this.logger.log('GET /transaction-items - Retrieving all transaction items', 'TransactionItemsController');

    try {
      const items = await this.getTransactionItems.execute();
      this.logger.log(`Retrieved ${items.length} transaction items`, 'TransactionItemsController');
      return items;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transaction items: ${errorMessage}`, errorStack, 'TransactionItemsController');
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`GET /transaction-items/${id} - Retrieving transaction item`, 'TransactionItemsController');

    try {
      const result = await this.getTransactionItem.execute(id);
      this.logger.log(`Transaction item retrieved: ${id}`, 'TransactionItemsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transaction item ${id}: ${errorMessage}`, errorStack, 'TransactionItemsController');
      throw error;
    }
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateTransactionItemDto) {
    this.logger.log(`PUT /transaction-items/${id} - Updating transaction item`, 'TransactionItemsController');

    try {
      const result = await this.updateTransactionItem.execute(id, payload);
      this.logger.log(`Transaction item updated successfully: ${id}`, 'TransactionItemsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update transaction item ${id}: ${errorMessage}`, errorStack, 'TransactionItemsController');
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`DELETE /transaction-items/${id} - Removing transaction item`, 'TransactionItemsController');

    try {
      await this.deleteTransactionItem.execute(id);
      this.logger.log(`Transaction item deleted successfully: ${id}`, 'TransactionItemsController');
      return { id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to delete transaction item ${id}: ${errorMessage}`, errorStack, 'TransactionItemsController');
      throw error;
    }
  }
}
