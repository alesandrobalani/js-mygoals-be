import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TestFileImportsModule } from '../modules/file-imports/test-file-imports.module';
import { ClaudeFileProcessorService } from '../infrastructure/ai/claude-file-processor.service';
import { FileImportEntity } from '../infrastructure/persistence/postgresql/file-import.entity';
import { ImportedTransactionEntity } from '../infrastructure/persistence/postgresql/imported-transaction.entity';
import { UserEntity } from '../infrastructure/persistence/postgresql/user.entity';
import { FileImportStatus } from '../domain/entities/file-import.entity';
import { UserRole } from '../domain/entities/user.entity';
import { TransactionType } from '../dto/create-transaction.dto';

const TEST_USER_ID = 'integration-test-user-id';
const mockExtractTransactions = jest.fn();

describe('FileImports integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestFileImportsModule],
    })
      .overrideProvider(ClaudeFileProcessorService)
      .useValue({ extractTransactions: mockExtractTransactions })
      .compile();

    app = moduleRef.createNestApplication();
    // Middleware que simula usuário autenticado (sem JWT em testes de integração)
    app.use((req: any, _res: any, next: any) => {
      req.user = { userId: TEST_USER_ID, email: 'test@test.com', role: UserRole.USER };
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
    );
    dataSource = moduleRef.get(DataSource, { strict: false });

    const user = new UserEntity();
    user.id = TEST_USER_ID;
    user.email = 'test@test.com';
    user.passwordHash = 'hash';
    user.name = 'Test User';
    user.role = UserRole.USER;
    await dataSource.getRepository(UserEntity).save(user);

    await app.init();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await dataSource.getRepository(ImportedTransactionEntity).clear();
    await dataSource.getRepository(FileImportEntity).clear();
  });

  afterAll(async () => {
    await app.close();
  });

  const csvContent = 'data,descricao,valor,tipo\n2024-01-10,Aluguel,1200,despesa';

  it('POST /file-imports - CSV válido retorna 201 com status completed', async () => {
    mockExtractTransactions.mockResolvedValue([
      {
        rawText: '2024-01-10,Aluguel,1200,despesa',
        description: 'Aluguel',
        amount: 1200,
        type: TransactionType.EXPENSE,
        categoryId: null,
        accountId: null,
        transactionItemId: null,
        transactionDate: new Date('2024-01-10'),
        dueDate: null,
        settled: true,
      },
    ]);

    const response = await request(app.getHttpServer())
      .post('/file-imports')
      .field('importIdentifier', 'test-import-001')
      .attach('file', Buffer.from(csvContent), { filename: 'extrato.csv', contentType: 'text/csv' });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe(FileImportStatus.COMPLETED);
    expect(response.body.importIdentifier).toBe('test-import-001');
    expect(response.body.id).toBeDefined();
  });

  it('POST /file-imports - sem arquivo retorna 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/file-imports')
      .field('importIdentifier', 'test-import-002');

    expect(response.status).toBe(400);
  });

  it('POST /file-imports - importIdentifier duplicado retorna 409', async () => {
    mockExtractTransactions.mockResolvedValue([]);

    await request(app.getHttpServer())
      .post('/file-imports')
      .field('importIdentifier', 'test-import-dup')
      .attach('file', Buffer.from(csvContent), { filename: 'extrato.csv', contentType: 'text/csv' });

    const response = await request(app.getHttpServer())
      .post('/file-imports')
      .field('importIdentifier', 'test-import-dup')
      .attach('file', Buffer.from(csvContent), { filename: 'extrato.csv', contentType: 'text/csv' });

    expect(response.status).toBe(409);
  });

  it('POST /file-imports - extensão inválida retorna 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/file-imports')
      .field('importIdentifier', 'test-import-txt')
      .attach('file', Buffer.from('conteudo'), { filename: 'arquivo.txt', contentType: 'text/plain' });

    expect(response.status).toBe(400);
  });
});
