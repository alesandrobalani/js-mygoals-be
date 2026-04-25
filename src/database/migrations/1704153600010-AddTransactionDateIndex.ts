import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionDateIndex1704153600010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX idx_transactions_transaction_date ON transactions ("transactionDate");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_transactions_transaction_date;`,
    );
  }
}
