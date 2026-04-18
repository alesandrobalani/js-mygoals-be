import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';
import { GetCategoriesUseCase } from './get-categories.usecase';

describe('GetCategoriesUseCase', () => {
  it('should return all categories including pre-seeded ones', async () => {
    const categoryRepository = new InMemoryCategoryRepository();
    const useCase = new GetCategoriesUseCase(categoryRepository as any);

    const result = await useCase.execute();

    expect(result.length).toBeGreaterThan(0);
  });

  it('should include user-created categories', async () => {
    const categoryRepository = new InMemoryCategoryRepository();
    const useCase = new GetCategoriesUseCase(categoryRepository as any);

    const initialCount = (await useCase.execute()).length;

    await categoryRepository.create({ id: 'custom-1', name: 'Investimentos', description: 'Renda variável', updatedAt: new Date() });

    const result = await useCase.execute();

    expect(result).toHaveLength(initialCount + 1);
    expect(result.some(c => c.id === 'custom-1')).toBe(true);
  });
});
