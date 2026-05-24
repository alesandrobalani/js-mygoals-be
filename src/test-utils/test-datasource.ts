import { DataSource } from 'typeorm';
import { AccountEntity } from '../infrastructure/persistence/postgresql/account.entity';
import { CategoryEntity } from '../infrastructure/persistence/postgresql/category.entity';
import { RefreshTokenEntity } from '../infrastructure/persistence/postgresql/refresh-token.entity';
import { TransactionItemEntity } from '../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionEntity } from '../infrastructure/persistence/postgresql/transaction.entity';
import { UserEntity } from '../infrastructure/persistence/postgresql/user.entity';
import { PostgreSQLAccountRepository } from '../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLCategoryRepository } from '../infrastructure/persistence/postgresql/category.repository';
import { PostgreSQLRefreshTokenRepository } from '../infrastructure/persistence/postgresql/refresh-token.repository';
import { PostgreSQLTransactionItemRepository } from '../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLTransactionRepository } from '../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLUserRepository } from '../infrastructure/persistence/postgresql/user.repository';
import { Category } from '../domain/entities/category.entity';

const ALL_ENTITIES = [
  AccountEntity,
  CategoryEntity,
  RefreshTokenEntity,
  TransactionItemEntity,
  TransactionEntity,
  UserEntity,
];

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

export async function createTestDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    entities: ALL_ENTITIES,
    synchronize: true,
    logging: false,
  });
  const driver = (dataSource as any).driver;
  driver.supportedDataTypes.push('timestamp');
  const origNorm = driver.normalizeType.bind(driver);
  driver.normalizeType = (col: any) =>
    col.type === 'timestamp' ? 'datetime' : origNorm(col);
  const origHydrate = driver.prepareHydratedValue.bind(driver);
  driver.prepareHydratedValue = (value: any, col: any) =>
    col.type === 'timestamp' ? origHydrate(value, { ...col, type: 'datetime' }) : origHydrate(value, col);
  const origPersist = driver.preparePersistentValue.bind(driver);
  driver.preparePersistentValue = (value: any, col: any) =>
    col.type === 'timestamp' ? origPersist(value, { ...col, type: 'datetime' }) : origPersist(value, col);
  await dataSource.initialize();
  return dataSource;
}

export function createTestRepositories(dataSource: DataSource) {
  return {
    accountRepository: new PostgreSQLAccountRepository(dataSource.getRepository(AccountEntity)),
    categoryRepository: new PostgreSQLCategoryRepository(dataSource.getRepository(CategoryEntity)),
    refreshTokenRepository: new PostgreSQLRefreshTokenRepository(dataSource.getRepository(RefreshTokenEntity)),
    transactionItemRepository: new PostgreSQLTransactionItemRepository(dataSource.getRepository(TransactionItemEntity)),
    transactionRepository: new PostgreSQLTransactionRepository(dataSource.getRepository(TransactionEntity)),
    userRepository: new PostgreSQLUserRepository(dataSource.getRepository(UserEntity)),
  };
}

export async function seedTestCategories(dataSource: DataSource): Promise<void> {
  const repo = new PostgreSQLCategoryRepository(dataSource.getRepository(CategoryEntity));
  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await repo.findById(cat.id);
    if (!exists) await repo.create(cat);
  }
}

export async function clearTestTables(dataSource: DataSource): Promise<void> {
  await dataSource.getRepository(TransactionEntity).clear();
  await dataSource.getRepository(RefreshTokenEntity).clear();
  await dataSource.getRepository(AccountEntity).clear();
  await dataSource.getRepository(TransactionItemEntity).clear();
  await dataSource.getRepository(CategoryEntity).clear();
  await dataSource.getRepository(UserEntity).clear();
}
