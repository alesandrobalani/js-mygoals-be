import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeTransactionTable1704153600005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX idx_transactions_transaction_item_id ON transactions (transactionItemId);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_account_id ON transactions (accountId);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_category_id ON transactions (categoryId);
    `);

    // Create composite index for common queries
    await queryRunner.query(`
      CREATE INDEX idx_transactions_due_date_type ON transactions (dueDate, type);
    `);

    // Partition the table by year using dueDate
    // First, create the partitioned table
    await queryRunner.query(`
      CREATE TABLE transactions_partitioned (
        id UUID PRIMARY KEY,
        description VARCHAR(255),
        amount NUMERIC(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        categoryId UUID NOT NULL,
        accountId UUID NOT NULL,
        transactionItemId UUID NOT NULL,
        transactionDate DATE NOT NULL,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dueDate DATE NOT NULL
      ) PARTITION BY RANGE (EXTRACT(YEAR FROM dueDate));
    `);

    // Create foreign key constraints on the partitioned table
    await queryRunner.query(`
      ALTER TABLE transactions_partitioned
      ADD CONSTRAINT fk_transactions_partitioned_category
      FOREIGN KEY (categoryId) REFERENCES categories(id);
    `);

    await queryRunner.query(`
      ALTER TABLE transactions_partitioned
      ADD CONSTRAINT fk_transactions_partitioned_account
      FOREIGN KEY (accountId) REFERENCES accounts(id);
    `);

    await queryRunner.query(`
      ALTER TABLE transactions_partitioned
      ADD CONSTRAINT fk_transactions_partitioned_transaction_item
      FOREIGN KEY (transactionItemId) REFERENCES transaction_items(id);
    `);

    // Create partitions for years 2020-2030 (adjust as needed)
    for (let year = 2020; year <= 2030; year++) {
      await queryRunner.query(`
        CREATE TABLE transactions_y${year} PARTITION OF transactions_partitioned
        FOR VALUES FROM (${year}) TO (${year + 1});
      `);
    }

    // Copy data from old table to partitioned table
    await queryRunner.query(`
      INSERT INTO transactions_partitioned
      SELECT * FROM transactions;
    `);

    // Drop old table and rename partitioned table
    await queryRunner.query(`DROP TABLE transactions;`);
    await queryRunner.query(`ALTER TABLE transactions_partitioned RENAME TO transactions;`);

    // Recreate indexes on the new partitioned table
    await queryRunner.query(`
      CREATE INDEX idx_transactions_transaction_item_id ON transactions (transactionItemId);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_account_id ON transactions (accountId);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_category_id ON transactions (categoryId);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_due_date_type ON transactions (dueDate, type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // For down migration, we'll recreate the original table structure
    // This is simplified - in production, you'd need to handle data migration back

    // Drop partitioned table
    await queryRunner.query(`DROP TABLE transactions;`);

    // Recreate original table
    await queryRunner.query(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY,
        description VARCHAR(255),
        amount NUMERIC(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        categoryId UUID NOT NULL,
        accountId UUID NOT NULL,
        transactionItemId UUID NOT NULL,
        transactionDate DATE NOT NULL,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dueDate DATE NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (accountId) REFERENCES accounts(id),
        FOREIGN KEY (transactionItemId) REFERENCES transaction_items(id)
      );
    `);

    // Note: Data will be lost in down migration - in production, backup data first
  }
}