import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CreateAccountDto } from '../../dto/create-account.dto';
import { UpdateAccountDto } from '../../dto/update-account.dto';
import { CreateAccountUseCase } from '../../use-cases/account/create-account.usecase';
import { GetAccountsUseCase } from '../../use-cases/account/get-accounts.usecase';
import { UpdateAccountUseCase } from '../../use-cases/account/update-account.usecase';
import { DeleteAccountUseCase } from '../../use-cases/account/delete-account.usecase';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';

@Roles(UserRole.USER)
@Controller('accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(
    private readonly createAccount: CreateAccountUseCase,
    private readonly getAccounts: GetAccountsUseCase,
    private readonly updateAccount: UpdateAccountUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateAccountDto) {
    this.logger.log(`POST /accounts - Creating account: ${payload.name}`, 'AccountsController');

    try {
      const result = await this.createAccount.execute(payload);
      this.logger.log(`Account created successfully: ${result.id}`, 'AccountsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create account: ${errorMessage}`, errorStack, 'AccountsController');
      throw error;
    }
  }

  @Get()
  async findAll() {
    this.logger.log('GET /accounts - Retrieving all accounts', 'AccountsController');

    try {
      const accounts = await this.getAccounts.execute();
      this.logger.log(`Retrieved ${accounts.length} accounts`, 'AccountsController');
      return accounts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve accounts: ${errorMessage}`, errorStack, 'AccountsController');
      throw error;
    }
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateAccountDto) {
    this.logger.log(`PUT /accounts/${id} - Updating account`, 'AccountsController');

    try {
      const result = await this.updateAccount.execute({ id, ...payload });
      this.logger.log(`Account updated successfully: ${result.id}`, 'AccountsController');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update account: ${errorMessage}`, errorStack, 'AccountsController');
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`DELETE /accounts/${id} - Deleting account`, 'AccountsController');

    try {
      await this.deleteAccount.execute(id);
      this.logger.log(`Account deleted successfully: ${id}`, 'AccountsController');
      return { id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to delete account: ${errorMessage}`, errorStack, 'AccountsController');
      throw error;
    }
  }
}
