import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Category } from '../domain/entities/category.entity';
import { User, UserRole } from '../domain/entities/user.entity';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { UserRepository } from '../domain/repositories/user.repository';

const DEFAULT_CATEGORIES: Category[] = [
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

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Optional() private dataSource?: DataSource,
    @Optional() @Inject('UserRepository') private userRepository?: UserRepository,
    @Optional() @Inject('CategoryRepository') private categoryRepository?: CategoryRepository,
  ) {}

  async runMigrations(): Promise<void> {
    if (!this.dataSource) {
      this.logger.log('DataSource not available, skipping migrations');
      return;
    }

    try {
      this.logger.log('Running pending migrations...');
      const migrations = await this.dataSource.runMigrations();
      this.logger.log(`Successfully ran ${migrations.length} migration(s)`);
    } catch (error) {
      this.logger.error('Error running migrations:', error);
      throw error;
    }
  }

  async seedDefaultData(): Promise<void> {
    if (this.categoryRepository) {
      for (const cat of DEFAULT_CATEGORIES) {
        const exists = await this.categoryRepository.findById(cat.id);
        if (!exists) {
          await this.categoryRepository.create(cat);
        }
      }
      this.logger.log('Categorias padrão verificadas/criadas', 'DatabaseService');
    }

    if (this.userRepository) {
      const existing = await this.userRepository.findByEmail('admin@mygoals.com');
      if (!existing) {
        const passwordHash = await bcrypt.hash('Admin@12345', 12);
        await this.userRepository.create(
          new User(randomUUID(), 'admin@mygoals.com', passwordHash, 'Administrador', UserRole.ADMIN, new Date()),
        );
        this.logger.log('Admin padrão criado: admin@mygoals.com', 'DatabaseService');
      }
    }
  }
}
