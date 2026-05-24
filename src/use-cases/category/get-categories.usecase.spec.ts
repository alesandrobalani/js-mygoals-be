import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { CategoryEntity } from '../../infrastructure/persistence/postgresql/category.entity';
import { GetCategoriesUseCase } from './get-categories.usecase';
import { randomUUID } from 'crypto';

describe('GetCategoriesUseCase', () => {
  let dataSource: DataSource;
  let categoryRepository: PostgreSQLCategoryRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    categoryRepository = createTestRepositories(dataSource).categoryRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });

  beforeEach(async () => {
    await dataSource.getRepository(CategoryEntity).clear();
    await seedTestCategories(dataSource);
  });

  it('should return all categories including pre-seeded ones', async () => {
    const useCase = new GetCategoriesUseCase(categoryRepository as any);

    const result = await useCase.execute();

    expect(result.length).toBeGreaterThan(0);
  });

  it('should include user-created categories', async () => {
    const useCase = new GetCategoriesUseCase(categoryRepository as any);

    const initialCount = (await useCase.execute()).length;

    await categoryRepository.create({ id: randomUUID(), name: 'Investimentos', description: 'Renda variÃ¡vel', updatedAt: new Date() });

    const result = await useCase.execute();

    expect(result).toHaveLength(initialCount + 1);
    expect(result.some(c => c.name === 'Investimentos')).toBe(true);
  });
});
