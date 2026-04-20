import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1704153600008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN role;`);
  }
}
