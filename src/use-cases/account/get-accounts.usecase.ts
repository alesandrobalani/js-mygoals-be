import { Inject, Injectable, Logger } from '@nestjs/common';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';

@Injectable()
export class GetAccountsUseCase {
  private readonly logger = new Logger(GetAccountsUseCase.name);

  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(): Promise<Account[]> {
    this.logger.log('Retrieving all accounts', 'GetAccountsUseCase');
    const accounts = await this.accountRepository.findAll();
    this.logger.log(`Retrieved ${accounts.length} accounts`, 'GetAccountsUseCase');
    return accounts;
  }
}
