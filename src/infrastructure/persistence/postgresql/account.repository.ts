import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRepository } from '../../../domain/repositories/account.repository';
import { Account } from '../../../domain/entities/account.entity';
import { AccountEntity } from './account.entity';

@Injectable()
export class PostgreSQLAccountRepository implements AccountRepository {
  private readonly logger = new Logger(PostgreSQLAccountRepository.name);

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async create(account: Account): Promise<Account> {
    this.logger.debug(`Creating account in database: ${account.id}`, 'PostgreSQLAccountRepository');

    const entity = new AccountEntity();
    entity.id = account.id;
    entity.name = account.name;
    entity.description = account.description;
    entity.updatedAt = account.updatedAt;

    const saved = await this.accountRepository.save(entity);
    return new Account(saved.id, saved.name, saved.description, saved.updatedAt);
  }

  async findAll(): Promise<Account[]> {
    this.logger.debug('Retrieving all accounts from database', 'PostgreSQLAccountRepository');
    const entities = await this.accountRepository.find();
    return entities.map(entity => new Account(entity.id, entity.name, entity.description, entity.updatedAt));
  }

  async findById(id: string): Promise<Account | null> {
    this.logger.debug(`Retrieving account by ID: ${id}`, 'PostgreSQLAccountRepository');
    const entity = await this.accountRepository.findOne({ where: { id } });
    if (!entity) return null;
    return new Account(entity.id, entity.name, entity.description, entity.updatedAt);
  }

  async findByName(name: string): Promise<Account | null> {
    this.logger.debug(`Retrieving account by name: ${name}`, 'PostgreSQLAccountRepository');
    const entity = await this.accountRepository.findOne({ where: { name } });
    if (!entity) return null;
    return new Account(entity.id, entity.name, entity.description, entity.updatedAt);
  }

  async update(account: Account): Promise<Account> {
    this.logger.debug(`Updating account in database: ${account.id}`, 'PostgreSQLAccountRepository');

    const entity = await this.accountRepository.preload({
      id: account.id,
      name: account.name,
      description: account.description,
    });
    if (!entity) {
      throw new Error(`Account with ID "${account.id}" not found`);
    }

    const saved = await this.accountRepository.save(entity);
    return new Account(saved.id, saved.name, saved.description, saved.updatedAt);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug(`Deleting account in database: ${id}`, 'PostgreSQLAccountRepository');
    await this.accountRepository.delete(id);
  }
}
