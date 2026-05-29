import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsTransferToCategory1704153600012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'categories',
      new TableColumn({
        name: 'isTransfer',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('categories', 'isTransfer');
  }
}
