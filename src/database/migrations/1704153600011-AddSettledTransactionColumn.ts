import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettledTransactionColumn1704153600011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE transactions ADD COLUMN settled BOOLEAN DEFAULT true;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE transactions DROP COLUMN IF EXISTS settled;`,
    );
  }
}
