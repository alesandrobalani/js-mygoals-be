import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCreatedAtToUpdatedAt1775257245424 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename createdAt to updatedAt in categories table
        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "createdAt" TO "updatedAt"`);

        // Rename createdAt to updatedAt in accounts table
        await queryRunner.query(`ALTER TABLE "accounts" RENAME COLUMN "createdAt" TO "updatedAt"`);

        // Rename createdAt to updatedAt in transactions table
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "createdAt" TO "updatedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rename updatedAt back to createdAt in categories table
        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "updatedAt" TO "createdAt"`);

        // Rename updatedAt back to createdAt in accounts table
        await queryRunner.query(`ALTER TABLE "accounts" RENAME COLUMN "updatedAt" TO "createdAt"`);

        // Rename updatedAt back to createdAt in transactions table
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "updatedAt" TO "createdAt"`);
    }

}
