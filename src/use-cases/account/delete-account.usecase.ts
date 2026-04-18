import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`Deleting account: ${id}`, 'DeleteAccountUseCase');
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new Error(`Account with ID "${id}" not found`);
    }

    const hasTransactions = await this.transactionRepository.existsByAccountId(id);
    if (hasTransactions) {
      throw new BadRequestException(`Cannot delete account "${account.name}" because it has associated transactions`);
    }

    await this.accountRepository.delete(id);
  }
}
