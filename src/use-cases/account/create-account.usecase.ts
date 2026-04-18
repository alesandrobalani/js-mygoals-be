import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';

export interface CreateAccountInput {
  name: string;
  description?: string;
}

@Injectable()
export class CreateAccountUseCase {
  private readonly logger = new Logger(CreateAccountUseCase.name);

  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    this.logger.log(`Creating account: ${input.name}`, 'CreateAccountUseCase');

    const existingAccount = await this.accountRepository.findByName(input.name);
    if (existingAccount) {
      throw new ConflictException(`Account with name "${input.name}" already exists`);
    }

    const account = new Account(
      randomUUID(),
      input.name,
      input.description,
      new Date(),
    );

    const result = await this.accountRepository.create(account);
    this.logger.log(`Account created successfully with ID: ${result.id}`, 'CreateAccountUseCase');
    return result;
  }
}
