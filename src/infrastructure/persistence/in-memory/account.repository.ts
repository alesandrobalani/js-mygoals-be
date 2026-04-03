import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../../domain/repositories/account.repository';
import { Account } from '../../../domain/entities/account.entity';

@Injectable()
export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Account[] = [];

  async create(account: Account): Promise<Account> {
    this.accounts.push(account);
    return account;
  }

  async findAll(): Promise<Account[]> {
    return [...this.accounts];
  }

  async findById(id: string): Promise<Account | null> {
    return this.accounts.find(account => account.id === id) || null;
  }

  async findByName(name: string): Promise<Account | null> {
    return this.accounts.find(account => account.name === name) || null;
  }

  async update(account: Account): Promise<Account> {
    const index = this.accounts.findIndex(item => item.id === account.id);
    if (index === -1) {
      throw new Error(`Account with ID "${account.id}" not found`);
    }
    this.accounts[index] = account;
    return account;
  }

  async delete(id: string): Promise<void> {
    this.accounts = this.accounts.filter(account => account.id !== id);
  }
}
