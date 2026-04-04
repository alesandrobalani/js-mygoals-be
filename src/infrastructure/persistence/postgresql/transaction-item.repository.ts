import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionItemRepository } from '../../../domain/repositories/transaction-item.repository';
import { TransactionItem } from '../../../domain/entities/transaction-item.entity';
import { TransactionItemEntity } from './transaction-item.entity';

@Injectable()
export class PostgreSQLTransactionItemRepository implements TransactionItemRepository {
  private readonly logger = new Logger(PostgreSQLTransactionItemRepository.name);

  constructor(
    @InjectRepository(TransactionItemEntity)
    private readonly transactionItemRepository: Repository<TransactionItemEntity>,
  ) {}

  async create(item: TransactionItem): Promise<TransactionItem> {
    this.logger.debug(`Creating transaction item in database: ${item.id}`, 'PostgreSQLTransactionItemRepository');

    const entity = new TransactionItemEntity();
    entity.id = item.id;
    entity.name = item.name;
    entity.description = item.description;

    const saved = await this.transactionItemRepository.save(entity);
    return new TransactionItem(saved.id, saved.name, saved.description, saved.updatedAt);
  }

  async findAll(): Promise<TransactionItem[]> {
    this.logger.debug('Retrieving all transaction items from database', 'PostgreSQLTransactionItemRepository');

    const entities = await this.transactionItemRepository.find();
    return entities.map(entity => new TransactionItem(entity.id, entity.name, entity.description, entity.updatedAt));
  }

  async findById(id: string): Promise<TransactionItem | null> {
    this.logger.debug(`Retrieving transaction item by ID: ${id}`, 'PostgreSQLTransactionItemRepository');

    const entity = await this.transactionItemRepository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }

    return new TransactionItem(entity.id, entity.name, entity.description, entity.updatedAt);
  }

  async findByName(name: string): Promise<TransactionItem | null> {
    this.logger.debug(`Retrieving transaction item by name: ${name}`, 'PostgreSQLTransactionItemRepository');

    const entity = await this.transactionItemRepository.findOne({ where: { name } });
    if (!entity) {
      return null;
    }

    return new TransactionItem(entity.id, entity.name, entity.description, entity.updatedAt);
  }

  async update(item: TransactionItem): Promise<TransactionItem> {
    this.logger.debug(`Updating transaction item: ${item.id}`, 'PostgreSQLTransactionItemRepository');

    const entity = await this.transactionItemRepository.findOne({ where: { id: item.id } });
    if (!entity) {
      throw new Error(`Transaction item with ID "${item.id}" not found`);
    }

    entity.name = item.name;
    entity.description = item.description;

    const saved = await this.transactionItemRepository.save(entity);
    return new TransactionItem(saved.id, saved.name, saved.description, saved.updatedAt);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug(`Deleting transaction item: ${id}`, 'PostgreSQLTransactionItemRepository');

    const result = await this.transactionItemRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Transaction item with ID "${id}" not found`);
    }
  }
}
