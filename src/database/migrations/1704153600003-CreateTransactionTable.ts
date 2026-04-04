import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTransactionTable1704153600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE transactions (
        id UUID NOT NULL,
        description VARCHAR(255),
        amount NUMERIC(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        "categoryId" UUID NOT NULL,
        "accountId" UUID NOT NULL,
        "transactionItemId" UUID NOT NULL,
        "transactionDate" DATE NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "dueDate" DATE NOT NULL,
        CONSTRAINT fk_category FOREIGN KEY ("categoryId") REFERENCES categories(id),
        CONSTRAINT fk_account FOREIGN KEY ("accountId") REFERENCES accounts(id),
        CONSTRAINT fk_transaction_item FOREIGN KEY ("transactionItemId") REFERENCES transaction_items(id)
      ) PARTITION BY RANGE (EXTRACT(YEAR FROM "dueDate"));
    `);    
    await queryRunner.query(`
      CREATE TABLE transactions_2020 PARTITION OF transactions
      FOR VALUES FROM ('2020') TO ('2021');
    `);    
    await queryRunner.query(`
      CREATE TABLE transactions_2021 PARTITION OF transactions
      FOR VALUES FROM ('2021') TO ('2022');
    `);    
    await queryRunner.query(`
      CREATE TABLE transactions_2022 PARTITION OF transactions
      FOR VALUES FROM ('2022') TO ('2023');
    `);    
    await queryRunner.query(`
      CREATE TABLE transactions_2023 PARTITION OF transactions
      FOR VALUES FROM ('2023') TO ('2024'); 
    `);
    await queryRunner.query(`
      CREATE TABLE transactions_2024 PARTITION OF transactions    
      FOR VALUES FROM ('2024') TO ('2025');
    `);
    await queryRunner.query(`
      CREATE TABLE transactions_2025 PARTITION OF transactions
      FOR VALUES FROM ('2025') TO ('2026');
    `);
    await queryRunner.query(`
      CREATE TABLE transactions_2026 PARTITION OF transactions
      FOR VALUES FROM ('2026') TO ('2027');
    `);
    await queryRunner.query(`
      CREATE TABLE transactions_2027 PARTITION OF transactions
      FOR VALUES FROM ('2027') TO ('2028'); 
    `);
    await queryRunner.query(`
      CREATE TABLE transactions_2028 PARTITION OF transactions
      FOR VALUES FROM ('2028') TO ('2029');
    `);
    await queryRunner.query(`
      CREATE TABLE transactions_2029 PARTITION OF transactions
      FOR VALUES FROM ('2029') TO ('2030');
    `);
    await queryRunner.query(`
      CREATE TABLE transactions_2030 PARTITION OF transactions
      FOR VALUES FROM ('2030') TO ('2031');
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_transactions_id ON transactions ("id");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_transaction_item_id ON transactions ("transactionItemId");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_account_id ON transactions ("accountId");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_category_id ON transactions ("categoryId");
    `);

    // Create composite index for common queries
    await queryRunner.query(`
      CREATE INDEX idx_transactions_due_date_type ON transactions ("dueDate", "type");
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
  }
}
