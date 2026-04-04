import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTransactionDescriptionOptional1704153600006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make description column nullable
    await queryRunner.query(`
      ALTER TABLE transactions ALTER COLUMN description DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Make description column required again
    await queryRunner.query(`
      ALTER TABLE transactions ALTER COLUMN description SET NOT NULL;
    `);
  }
}