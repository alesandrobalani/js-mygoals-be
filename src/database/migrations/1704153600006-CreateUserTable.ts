import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1704153600006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
