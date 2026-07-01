import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TransactionRepository, TransactionByTypeAndSettledSummary, TransactionByAccountAndTypeAndSettledSummary, PaginatedTransactions, TransferResult } from '../../../domain/repositories/transaction.repository';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Account } from '../../../domain/entities/account.entity';
import { TransactionItem } from '../../../domain/entities/transaction-item.entity';
import { TransactionEntity } from './transaction.entity';
import { TransactionItemEntity } from './transaction-item.entity';

@Injectable()
export class PostgreSQLTransactionRepository implements TransactionRepository {
  private readonly logger = new Logger(PostgreSQLTransactionRepository.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    this.logger.debug(`Creating transaction in database: ${transaction.id}`, 'PostgreSQLTransactionRepository');

    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.description = transaction.description ?? null;
    entity.amount = transaction.amount;
    entity.type = transaction.type;
    entity.categoryId = transaction.category.id;
    entity.transactionItemId = transaction.transactionItem.id;
    entity.accountId = transaction.account.id;
    entity.transactionDate = transaction.transactionDate;
    entity.dueDate = transaction.dueDate;
    entity.settled = transaction.settled;

    try {
      const savedEntity = await this.transactionRepository.save(entity);
      this.logger.debug(`Transaction saved successfully: ${savedEntity.id}`, 'PostgreSQLTransactionRepository');

      const loadedEntity = await this.transactionRepository.findOne({
        where: { id: savedEntity.id },
        relations: ['category', 'account', 'transactionItem'],
      });
      if (!loadedEntity) {
        throw new Error(`Failed to load saved transaction ${savedEntity.id}`);
      }

      return {
        id: loadedEntity.id,
        description: loadedEntity.description || undefined,
        amount: loadedEntity.amount,
        type: loadedEntity.type,
        category: loadedEntity.category,
        transactionItem: new TransactionItem(
          loadedEntity.transactionItem.id,
          loadedEntity.transactionItem.name,
          loadedEntity.transactionItem.description,
          loadedEntity.transactionItem.updatedAt,
        ),
        transactionDate: loadedEntity.transactionDate,
        account: loadedEntity.account,
        updatedAt: loadedEntity.updatedAt,
        dueDate: loadedEntity.dueDate || loadedEntity.transactionDate,
        settled: loadedEntity.settled
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to save transaction ${transaction.id}: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }

  async createPair(debit: Transaction, credit: Transaction): Promise<TransferResult> {
    this.logger.debug(`Creating transfer pair: debit=${debit.id}, credit=${credit.id}`, 'PostgreSQLTransactionRepository');

    const toEntity = (t: Transaction): TransactionEntity => {
      const e = new TransactionEntity();
      e.id = t.id;
      e.description = t.description ?? null;
      e.amount = t.amount;
      e.type = t.type;
      e.categoryId = t.category.id;
      e.transactionItemId = t.transactionItem.id;
      e.accountId = t.account.id;
      e.transactionDate = t.transactionDate;
      e.dueDate = t.dueDate;
      e.settled = t.settled;
      return e;
    };

    const toDomain = (e: TransactionEntity): Transaction => ({
      id: e.id,
      description: e.description || undefined,
      amount: e.amount,
      type: e.type,
      category: e.category,
      transactionItem: new TransactionItem(e.transactionItem.id, e.transactionItem.name, e.transactionItem.description, e.transactionItem.updatedAt),
      transactionDate: e.transactionDate,
      account: e.account,
      updatedAt: e.updatedAt,
      dueDate: e.dueDate || e.transactionDate,
      settled: e.settled,
    });

    try {
      const [savedDebitId, savedCreditId] = await this.transactionRepository.manager.transaction(async (manager) => {
        const savedDebit = await manager.save(TransactionEntity, toEntity(debit));
        const savedCredit = await manager.save(TransactionEntity, toEntity(credit));
        return [savedDebit.id, savedCredit.id];
      });

      const [debitEntity, creditEntity] = await Promise.all([
        this.transactionRepository.findOne({ where: { id: savedDebitId }, relations: ['category', 'account', 'transactionItem'] }),
        this.transactionRepository.findOne({ where: { id: savedCreditId }, relations: ['category', 'account', 'transactionItem'] }),
      ]);

      if (!debitEntity || !creditEntity) {
        throw new Error('Failed to load saved transfer transactions');
      }

      this.logger.debug(`Transfer pair created: debit=${savedDebitId}, credit=${savedCreditId}`, 'PostgreSQLTransactionRepository');
      return { debit: toDomain(debitEntity), credit: toDomain(creditEntity) };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create transfer pair: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }

  async update(transaction: Transaction): Promise<Transaction> {
    this.logger.debug(`Updating transaction in database: ${transaction.id}`, 'PostgreSQLTransactionRepository');

    try {
      const entity = await this.transactionRepository.findOne({ where: { id: transaction.id } });
      if (!entity) {
        throw new Error(`Transaction ${transaction.id} not found`);
      }

      entity.description = transaction.description ?? null;
      entity.amount = transaction.amount;
      entity.type = transaction.type;
      entity.categoryId = transaction.category.id;
      entity.transactionItemId = transaction.transactionItem.id;
      entity.accountId = transaction.account.id;
      entity.transactionDate = transaction.transactionDate;
      entity.dueDate = transaction.dueDate;
      entity.settled = Boolean(transaction.settled);

      const savedEntity = await this.transactionRepository.save(entity);
      this.logger.debug(`Transaction updated successfully: ${savedEntity.id}`, 'PostgreSQLTransactionRepository');

      const loadedEntity = await this.transactionRepository.findOne({
        where: { id: savedEntity.id },
        relations: ['category', 'account', 'transactionItem'],
      });
      if (!loadedEntity) {
        throw new Error(`Failed to load updated transaction ${savedEntity.id}`);
      }

      return {
        id: loadedEntity.id,
        description: loadedEntity.description || undefined,
        amount: loadedEntity.amount,
        type: loadedEntity.type,
        category: loadedEntity.category,
        transactionItem: new TransactionItem(
          loadedEntity.transactionItem.id,
          loadedEntity.transactionItem.name,
          loadedEntity.transactionItem.description,
          loadedEntity.transactionItem.updatedAt,
        ),
        transactionDate: loadedEntity.transactionDate,
        account: loadedEntity.account,
        updatedAt: loadedEntity.updatedAt,
        dueDate: loadedEntity.dueDate || loadedEntity.transactionDate,
        settled: loadedEntity.settled,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update transaction ${transaction.id}: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }

  async findAll(): Promise<Transaction[]> {
    this.logger.debug('Retrieving all transactions from database', 'PostgreSQLTransactionRepository');

    try {
      const entities = await this.transactionRepository.find({
        relations: ['category', 'account', 'transactionItem'],
      });
      this.logger.debug(`Retrieved ${entities.length} transactions from database`, 'PostgreSQLTransactionRepository');

      return entities.map(entity => ({
        id: entity.id,
        description: entity.description || undefined,
        amount: entity.amount,
        type: entity.type,
        category: entity.category,
        transactionItem: new TransactionItem(
          entity.transactionItem.id,
          entity.transactionItem.name,
          entity.transactionItem.description,
          entity.transactionItem.updatedAt,
        ),
        transactionDate: entity.transactionDate,
        account: entity.account,
        updatedAt: entity.updatedAt,
        dueDate: entity.dueDate || entity.transactionDate,
        settled: entity.settled
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transactions: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    this.logger.debug(`Retrieving transaction by ID: ${id}`, 'PostgreSQLTransactionRepository');

    try {
      const entity = await this.transactionRepository.findOne({ 
        where: { id },
        relations: ['category', 'account', 'transactionItem'],
      });
      if (!entity) {
        this.logger.debug(`Transaction not found: ${id}`, 'PostgreSQLTransactionRepository');
        return null;
      }

      this.logger.debug(`Transaction found: ${id}`, 'PostgreSQLTransactionRepository');
      return {
        id: entity.id,
        description: entity.description || undefined,
        amount: entity.amount,
        type: entity.type,
        category: entity.category,
        transactionItem: new TransactionItem(
          entity.transactionItem.id,
          entity.transactionItem.name,
          entity.transactionItem.description,
          entity.transactionItem.updatedAt,
        ),
        transactionDate: entity.transactionDate,
        account: entity.account,
        updatedAt: entity.updatedAt,
        dueDate: entity.dueDate || entity.transactionDate,
        settled: entity.settled
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transaction ${id}: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }
  
  async delete(id: string): Promise<void> {
    await this.transactionRepository.delete(id);
  }

  async existsByAccountId(accountId: string): Promise<boolean> {
    return this.transactionRepository.exists({ where: { accountId } });
  }

  async existsByTransactionItemId(transactionItemId: string): Promise<boolean> {
    return this.transactionRepository.exists({ where: { transactionItemId } });
  }

  async findByPeriod(startDate: Date, endDate: Date, page: number, limit: number): Promise<PaginatedTransactions> {
    this.logger.debug(`Searching transactions from ${startDate} to ${endDate} page=${page} limit=${limit}`, 'PostgreSQLTransactionRepository');

    const skip = (page - 1) * limit;

    const [entities, total] = await this.transactionRepository.findAndCount({
      where: { dueDate: Between(startDate, endDate) },
      relations: ['category', 'account', 'transactionItem'],
      order: { dueDate: 'DESC' },
      skip,
      take: limit,
    });

    const data = entities.map(entity => ({
      id: entity.id,
      description: entity.description || undefined,
      amount: entity.amount,
      type: entity.type,
      category: entity.category,
      transactionItem: new TransactionItem(
        entity.transactionItem.id,
        entity.transactionItem.name,
        entity.transactionItem.description,
        entity.transactionItem.updatedAt,
      ),
      transactionDate: entity.transactionDate,
      account: entity.account,
      updatedAt: entity.updatedAt,
      dueDate: entity.dueDate || entity.transactionDate,
      settled: entity.settled
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]> {
    this.logger.debug(`Retrieving all transactions from ${startDate} to ${endDate}`, 'PostgreSQLTransactionRepository');

    const entities = await this.transactionRepository.find({
      where: { dueDate: Between(startDate, endDate) },
      relations: ['category', 'account', 'transactionItem'],
      order: { dueDate: 'DESC' },
    });

    return entities.map(entity => ({
      id: entity.id,
      description: entity.description || undefined,
      amount: entity.amount,
      type: entity.type,
      category: entity.category,
      transactionItem: new TransactionItem(
        entity.transactionItem.id,
        entity.transactionItem.name,
        entity.transactionItem.description,
        entity.transactionItem.updatedAt,
      ),
      transactionDate: entity.transactionDate,
      account: entity.account,
      updatedAt: entity.updatedAt,
      dueDate: entity.dueDate || entity.transactionDate,
      settled: entity.settled,
    }));
  }

  async findSumGroupByAccountAndTypeAndSettled(endDate: Date): Promise<TransactionByAccountAndTypeAndSettledSummary[]> {
    this.logger.debug(`Retrieving transaction summary by account to ${endDate}`, 'PostgreSQLTransactionRepository');

    const rows = await this.transactionRepository
      .createQueryBuilder('t')
      .innerJoin('t.account', 'a')
      .select('a.name', 'accountName')
      .addSelect('t.type', 'type')
      .addSelect('t.settled', 'settled')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.dueDate <= :endDate', { endDate })
      .groupBy('a.name')
      .addGroupBy('t.type')
      .addGroupBy('t.settled')
      .getRawMany<{ accountName: string; type: string; settled: boolean; total: string }>();

    const map = new Map<string, TransactionByAccountAndTypeAndSettledSummary>();
    for (const row of rows) {
      if (!map.has(row.accountName)) {
        map.set(row.accountName, { accountName: row.accountName, incomeSettled: 0, incomeNotSettled: 0, expenseSettled: 0, expenseNotSettled: 0 });
      }
      const entry = map.get(row.accountName)!;
      if (row.type === 'income' && row.settled) entry.incomeSettled = Number(row.total);
      if (row.type === 'income' && !row.settled) entry.incomeNotSettled = Number(row.total);
      if (row.type === 'expense' && row.settled) entry.expenseSettled = Number(row.total);
      if (row.type === 'expense' && !row.settled) entry.expenseNotSettled = Number(row.total);
    }
    return Array.from(map.values());
  }

  async findSumByPeriodGroupByTypeAndSettled(startDate: Date, endDate: Date): Promise<TransactionByTypeAndSettledSummary> {
    this.logger.debug(`Retrieving transaction summary from ${startDate} to ${endDate}`, 'PostgreSQLTransactionRepository');

    const rows = await this.transactionRepository
      .createQueryBuilder('t')
      .innerJoin('t.category', 'c')
      .select('t.type', 'type')
      .addSelect('t.settled', 'settled')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.dueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('c.isTransfer = false')
      .groupBy('t.type')
      .addGroupBy('t.settled')
      .getRawMany<{ type: string; settled: boolean; total: string }>();

    const result: TransactionByTypeAndSettledSummary = { incomeSettled: 0, incomeNotSettled: 0, expenseSettled: 0, expenseNotSettled: 0 };
    for (const row of rows) {
      if (row.type === 'income' && row.settled) result.incomeSettled = Number(row.total);
      if (row.type === 'income' && !row.settled) result.incomeNotSettled = Number(row.total);
      if (row.type === 'expense' && row.settled) result.expenseSettled = Number(row.total);
      if (row.type === 'expense' && !row.settled) result.expenseNotSettled = Number(row.total);
    }
    return result;
  }
}