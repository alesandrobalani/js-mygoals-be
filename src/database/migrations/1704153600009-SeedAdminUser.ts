import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export class SeedAdminUser1704153600009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing = await queryRunner.query(
      `SELECT id FROM users WHERE email = 'admin@mygoals.com'`,
    );
    if (existing.length > 0) return;

    const passwordHash = await bcrypt.hash('Admin@12345', 12);
    const id = randomUUID();

    await queryRunner.query(
      `INSERT INTO users (id, email, "passwordHash", name, role, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, 'admin@mygoals.com', passwordHash, 'Administrador', 'admin'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE email = 'admin@mygoals.com'`);
  }
}
