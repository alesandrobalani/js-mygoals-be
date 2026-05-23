import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { CategoryEntity } from '../../infrastructure/persistence/postgresql/category.entity';
import { CreateCategoryUseCase } from './create-category.usecase';

describe('CreateCategoryUseCase', () => {
  let dataSource: DataSource;
  let categoryRepository: PostgreSQLCategoryRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    categoryRepository = createTestRepositories(dataSource).categoryRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(CategoryEntity).clear(); });

  it('should create a category', async () => {
    const useCase = new CreateCategoryUseCase(categoryRepository as any);

    const category = await useCase.execute({
      name: 'Nova Categoria',
      description: 'DescriÃ§Ã£o de teste',
    });

    expect(category).toMatchObject({
      name: 'Nova Categoria',
      description: 'DescriÃ§Ã£o de teste',
    });
    expect(category.id).toBeDefined();
    expect(category.updatedAt).toBeInstanceOf(Date);
  });

  it('should not create a category with a duplicate name', async () => {
    const useCase = new CreateCategoryUseCase(categoryRepository as any);

    await useCase.execute({ name: 'Categoria Existente', description: 'Primeira categoria' });

    await expect(
      useCase.execute({ name: 'Categoria Existente', description: 'Segunda categoria' }),
    ).rejects.toThrow('Category with name "Categoria Existente" already exists');
  });
});
