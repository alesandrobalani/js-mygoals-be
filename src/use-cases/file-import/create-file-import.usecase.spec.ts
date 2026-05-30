import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLFileImportRepository } from '../../infrastructure/persistence/postgresql/file-import.repository';
import { PostgreSQLImportedTransactionRepository } from '../../infrastructure/persistence/postgresql/imported-transaction.repository';
import { FileImportEntity } from '../../infrastructure/persistence/postgresql/file-import.entity';
import { ImportedTransactionEntity } from '../../infrastructure/persistence/postgresql/imported-transaction.entity';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { CreateFileImportUseCase } from './create-file-import.usecase';
import { FileImportStatus } from '../../domain/entities/file-import.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { ClaudeFileProcessorService } from '../../infrastructure/ai/claude-file-processor.service';
import { UserRole } from '../../domain/entities/user.entity';

const TEST_USER_ID = 'test-user-id-file-import';

const mockClaudeService = {
  extractTransactions: jest.fn(),
} as unknown as ClaudeFileProcessorService;

describe('CreateFileImportUseCase', () => {
  let dataSource: DataSource;
  let fileImportRepository: PostgreSQLFileImportRepository;
  let importedTransactionRepository: PostgreSQLImportedTransactionRepository;
  let categoryRepository: ReturnType<typeof createTestRepositories>['categoryRepository'];
  let transactionItemRepository: ReturnType<typeof createTestRepositories>['transactionItemRepository'];

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    fileImportRepository = repos.fileImportRepository;
    importedTransactionRepository = repos.importedTransactionRepository;
    categoryRepository = repos.categoryRepository;
    transactionItemRepository = repos.transactionItemRepository;

    const user = new UserEntity();
    user.id = TEST_USER_ID;
    user.email = 'test-file-import@example.com';
    user.passwordHash = 'hash';
    user.name = 'Test User';
    user.role = UserRole.USER;
    await dataSource.getRepository(UserEntity).save(user);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await dataSource.getRepository(ImportedTransactionEntity).clear();
    await dataSource.getRepository(FileImportEntity).clear();
  });

  const makeUseCase = () =>
    new CreateFileImportUseCase(
      fileImportRepository as any,
      importedTransactionRepository as any,
      categoryRepository as any,
      transactionItemRepository as any,
      mockClaudeService,
    );

  const csvBuffer = Buffer.from('data,valor,tipo\n2024-01-10,100,despesa');

  it('deve criar registro e persistir transações extraídas pelo Claude', async () => {
    (mockClaudeService.extractTransactions as jest.Mock).mockResolvedValue([
      {
        rawText: '2024-01-10,100,despesa',
        description: 'Aluguel',
        amount: 100,
        type: TransactionType.EXPENSE,
        categoryId: null,
        accountId: null,
        transactionItemId: null,
        transactionDate: new Date('2024-01-10'),
        dueDate: null,
        settled: true,
      },
    ]);

    const useCase = makeUseCase();
    const result = await useCase.execute({
      userId: TEST_USER_ID,
      importIdentifier: 'import-001',
      originalFileName: 'extrato.csv',
      fileBuffer: csvBuffer,
    });

    expect(result.status).toBe(FileImportStatus.COMPLETED);
    expect(result.importIdentifier).toBe('import-001');
    expect(result.id).toBeDefined();

    const saved = await importedTransactionRepository.findByFileImportId(result.id);
    expect(saved).toHaveLength(1);
    expect(saved[0].description).toBe('Aluguel');
    expect(saved[0].amount).toBe(100);
    expect(saved[0].type).toBe(TransactionType.EXPENSE);
  });

  it('deve lançar ConflictException se importIdentifier já existe', async () => {
    (mockClaudeService.extractTransactions as jest.Mock).mockResolvedValue([]);

    const useCase = makeUseCase();
    await useCase.execute({
      userId: TEST_USER_ID,
      importIdentifier: 'import-duplicado',
      originalFileName: 'extrato.csv',
      fileBuffer: csvBuffer,
    });

    await expect(
      useCase.execute({
        userId: TEST_USER_ID,
        importIdentifier: 'import-duplicado',
        originalFileName: 'outro.csv',
        fileBuffer: csvBuffer,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve atualizar status para FAILED e relançar erro quando Claude falha', async () => {
    (mockClaudeService.extractTransactions as jest.Mock).mockRejectedValue(
      new Error('API indisponível'),
    );

    const useCase = makeUseCase();
    await expect(
      useCase.execute({
        userId: TEST_USER_ID,
        importIdentifier: 'import-falha',
        originalFileName: 'extrato.csv',
        fileBuffer: csvBuffer,
      }),
    ).rejects.toThrow('API indisponível');

    const failed = await fileImportRepository.findByImportIdentifier('import-falha');
    expect(failed?.status).toBe(FileImportStatus.FAILED);
    expect(failed?.errorMessage).toBe('API indisponível');
  });

  it('deve criar registro com 0 transações quando Claude retorna array vazio', async () => {
    (mockClaudeService.extractTransactions as jest.Mock).mockResolvedValue([]);

    const useCase = makeUseCase();
    const result = await useCase.execute({
      userId: TEST_USER_ID,
      importIdentifier: 'import-vazio',
      originalFileName: 'extrato.csv',
      fileBuffer: csvBuffer,
    });

    expect(result.status).toBe(FileImportStatus.COMPLETED);
    const saved = await importedTransactionRepository.findByFileImportId(result.id);
    expect(saved).toHaveLength(0);
  });
});
