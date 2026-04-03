import { Inject, Injectable, Logger } from '@nestjs/common';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';

export interface UpdateAccountInput {
  id: string;
  name: string;
  description?: string;
}

@Injectable()
export class UpdateAccountUseCase {
  private readonly logger = new Logger(UpdateAccountUseCase.name);

  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(input: UpdateAccountInput): Promise<Account> {
    this.logger.log(`Updating account: ${input.id}`, 'UpdateAccountUseCase');

    const existingAccount = await this.accountRepository.findById(input.id);
    if (!existingAccount) {
      throw new Error(`Account with ID "${input.id}" not found`);
    }

    const updatedAccount = new Account(
      existingAccount.id,
      input.name,
      input.description ?? existingAccount.description,
      new Date(),
    );

    return this.accountRepository.update(updatedAccount);
  }
}
