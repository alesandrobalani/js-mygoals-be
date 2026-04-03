import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTransactionTable1704153600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['income', 'expense'],
            isNullable: false,
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'HABITACAO',
              'SERVICOS_PUBLICOS',
              'EDUCACAO',
              'SAUDE',
              'ALIMENTACAO',
              'TRANSPORTE',
              'LAZER',
              'CUIDADOS_PESSOAIS',
              'RENDA_ATIVA',
              'RENDA_EXTRA',
              'RENDA_PASSIVA',
            ],
            isNullable: false,
          },
          {
            name: 'transactionDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'account',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'dueDate',
            type: 'date',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
  }
}
