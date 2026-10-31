import { DataSource } from 'typeorm';

type ColumnLike = { type?: unknown } & Record<string, unknown>;

/** Parte interna do driver better-sqlite3 do TypeORM que precisamos sobrescrever. */
interface PatchableSqliteDriver {
  supportedDataTypes: string[];
  normalizeType(column: ColumnLike): string;
  prepareHydratedValue(value: unknown, column: ColumnLike): unknown;
  preparePersistentValue(value: unknown, column: ColumnLike): unknown;
}

/**
 * As entidades usam `timestamp` (Postgres), que o SQLite não conhece.
 * Nos testes, trata `timestamp` como `datetime` no driver em memória.
 */
export function patchSqliteDriverForTimestamp(dataSource: DataSource): void {
  const driver = dataSource.driver as unknown as PatchableSqliteDriver;
  const asDatetime = (column: ColumnLike): ColumnLike =>
    column.type === 'timestamp' ? { ...column, type: 'datetime' } : column;

  driver.supportedDataTypes.push('timestamp');

  const origNormalizeType = driver.normalizeType.bind(driver);
  driver.normalizeType = (column) => (column.type === 'timestamp' ? 'datetime' : origNormalizeType(column));

  const origHydrate = driver.prepareHydratedValue.bind(driver);
  driver.prepareHydratedValue = (value, column) => origHydrate(value, asDatetime(column));

  const origPersist = driver.preparePersistentValue.bind(driver);
  driver.preparePersistentValue = (value, column) => origPersist(value, asDatetime(column));
}
