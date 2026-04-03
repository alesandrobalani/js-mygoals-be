import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { Category } from '../../../domain/entities/category.entity';

@Injectable()
export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [
    new Category('1', 'Habitação', 'Despesas relacionadas à moradia', new Date()),
    new Category('2', 'Serviços públicos', 'Água, luz, gás, internet', new Date()),
    new Category('3', 'Educação', 'Escola, cursos, livros', new Date()),
    new Category('4', 'Saúde', 'Médicos, remédios, plano de saúde', new Date()),
    new Category('5', 'Alimentação', 'Compras de supermercado, restaurantes', new Date()),
    new Category('6', 'Transporte', 'Ônibus, metrô, combustível, manutenção', new Date()),
    new Category('7', 'Lazer', 'Cinema, shows, hobbies', new Date()),
    new Category('8', 'Cuidados pessoais', 'Cabeleireiro, cosméticos, academia', new Date()),
    new Category('9', 'Renda Ativa', 'Salário, trabalho principal', new Date()),
    new Category('10', 'Renda extra', 'Trabalhos adicionais, freelas', new Date()),
    new Category('11', 'Renda passiva', 'Investimentos, aluguéis', new Date()),
  ];

  async create(category: Category): Promise<Category> {
    this.categories.push(category);
    return category;
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories];
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find(cat => cat.id === id) || null;
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categories.find(cat => cat.name === name) || null;
  }
}