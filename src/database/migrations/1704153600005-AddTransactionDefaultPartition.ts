import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionDefaultPartition1704153600005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS transactions_default PARTITION OF transactions DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS transactions_default;`);
  }
}
