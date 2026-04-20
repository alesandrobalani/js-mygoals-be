import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokenTable1704153600007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id UUID PRIMARY KEY,
        token VARCHAR(512) UNIQUE NOT NULL,
        "userId" UUID NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "revokedAt" TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_refresh_token_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);`);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_userId ON refresh_tokens("userId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_refresh_tokens_token;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_refresh_tokens_userId;`);
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens;`);
  }
}
