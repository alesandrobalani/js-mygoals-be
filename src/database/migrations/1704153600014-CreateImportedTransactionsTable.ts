import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImportedTransactionsTable1704153600014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE imported_transactions (
        id UUID PRIMARY KEY,
        "fileImportId" UUID NOT NULL,
        "rawText" TEXT NOT NULL,
        description TEXT,
        amount NUMERIC(10,2),
        type VARCHAR(50) CHECK (type IN ('income', 'expense')),
        "categoryId" UUID,
        "accountId" UUID,
        "transactionItemId" UUID,
        "transactionDate" DATE,
        "dueDate" DATE,
        settled BOOLEAN,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_imported_transactions_file_import
          FOREIGN KEY ("fileImportId") REFERENCES file_imports(id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_imported_transactions_file_import_id ON imported_transactions ("fileImportId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_imported_transactions_file_import_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS imported_transactions`);
  }
}
