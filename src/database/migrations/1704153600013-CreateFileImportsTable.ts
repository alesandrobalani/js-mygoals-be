import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileImportsTable1704153600013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE file_imports (
        id UUID PRIMARY KEY,
        "userId" UUID NOT NULL,
        "importIdentifier" VARCHAR(255) NOT NULL UNIQUE,
        "originalFileName" VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_file_imports_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_file_imports_user_id ON file_imports ("userId")`);
    await queryRunner.query(`CREATE INDEX idx_file_imports_import_identifier ON file_imports ("importIdentifier")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_file_imports_import_identifier`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_file_imports_user_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS file_imports`);
  }
}
