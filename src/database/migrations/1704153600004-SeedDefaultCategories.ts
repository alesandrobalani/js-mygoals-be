import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class SeedDefaultCategories1704153600004 implements MigrationInterface {
  private readonly categories = [
    { name: 'Habitação', description: 'Categoria para despesas de habitação' },
    { name: 'Serviços públicos', description: 'Categoria para contas de serviços públicos' },
    { name: 'Educação', description: 'Categoria para gastos com educação' },
    { name: 'Saúde', description: 'Categoria para despesas com saúde' },
    { name: 'Alimentação', description: 'Categoria para gastos com alimentação' },
    { name: 'Transporte', description: 'Categoria para gastos com transporte' },
    { name: 'Lazer', description: 'Categoria para gastos de lazer' },
    { name: 'Cuidados pessoais', description: 'Categoria para gastos pessoais' },
    { name: 'Renda Ativa', description: 'Categoria para renda ativa' },
    { name: 'Renda extra', description: 'Categoria para renda extra' },
    { name: 'Renda passiva', description: 'Categoria para renda passiva' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const category of this.categories) {
      await queryRunner.query(
        `INSERT INTO categories (id, name, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [crypto.randomUUID(), category.name, category.description],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM categories
      WHERE name IN (
        'Habitação',
        'Serviços públicos',
        'Educação',
        'Saúde',
        'Alimentação',
        'Transporte',
        'Lazer',
        'Cuidados pessoais',
        'Renda Ativa',
        'Renda extra',
        'Renda passiva'
      );
    `);
  }
}
