import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';
import { CreateCategoryUseCase } from './create-category.usecase';

describe('CreateCategoryUseCase', () => {
  it('should create a category', async () => {
    const categoryRepository = new InMemoryCategoryRepository();
    const useCase = new CreateCategoryUseCase(categoryRepository as any);

    const category = await useCase.execute({
      name: 'Nova Categoria',
      description: 'Descrição de teste',
    });

    expect(category).toMatchObject({
      name: 'Nova Categoria',
      description: 'Descrição de teste',
    });
    expect(category.id).toBeDefined();
    expect(category.createdAt).toBeInstanceOf(Date);
  });

  it('should not create a category with a duplicate name', async () => {
    const categoryRepository = new InMemoryCategoryRepository();
    const useCase = new CreateCategoryUseCase(categoryRepository as any);

    await useCase.execute({
      name: 'Categoria Existente',
      description: 'Primeira categoria',
    });

    await expect(
      useCase.execute({
        name: 'Categoria Existente',
        description: 'Segunda categoria',
      }),
    ).rejects.toThrow('Category with name "Categoria Existente" already exists');
  });
});
