import { Account } from '../entities/account.entity';

export interface AccountRepository {
  create(account: Account): Promise<Account>;
  findAll(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  findByName(name: string): Promise<Account | null>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
}
