# Plano — 10-copy-transactions

Aprovado em 2026-10-31.

## Componentes

- **Migration**: nenhuma (sem mudança de schema).
- **Utilitário** `src/utils/date-only.ts`: `addMonthsClamped(date, months)`, `toDateOnly(date)`, `parseYearMonth`, `monthsBetween`, `fromDateOnly`.
  Colunas `date` voltam do TypeORM como `'YYYY-MM-DD'` e são gravadas com getters locais, então a aritmética é feita sobre
  componentes Y/M/D e os `Date` gerados são meia-noite local (evita deslocar o dia conforme o fuso). Testes em `date-only.spec.ts`.
- **Repositório** (`TransactionRepository` + `PostgreSQLTransactionRepository`):
  - `findByIds(ids)`
  - `findAllByDueDateRange(start, end)` — candidatos a duplicado (uma consulta, faixa mín→máx dos meses de destino)
  - `createMany(transactions)` — `manager.transaction`, tudo ou nada
- **Use case** `src/use-cases/transaction/copy-transactions.usecase.ts`:
  1. busca origens → ids faltantes ⇒ 404 (nada criado)
  2. transferências ⇒ 400 (nada criado)
  3. gera cópias origem × mês (`settled=false`, novo uuid, `updatedAt=now`, dueDate e transactionDate via `addMonthsClamped`)
  4. dedup contra o banco **e** dentro do próprio lote; chave: account, category, transactionItem, type, amount (centavos),
     description (`null`/`''`/`undefined` equivalentes), dueDate
  5. `dryRun=false` ⇒ `createMany`
- **DTO** `src/dto/copy-transactions.dto.ts` com class-validator.
- **Controller**: `@Post('copy')` + `@HttpCode(200)`; use case registrado em `TransactionsModule` e `TestTransactionsModule`.

## Contrato HTTP

```
POST /transactions/copy        (JWT, role USER)
Body: { transactionIds: uuid[1..500] únicos, targetMonths: "YYYY-MM"[1..24] únicos, dryRun?: boolean (default false) }

200 {
  dryRun: boolean,
  created: [{ sourceId, targetMonth, description, amount, type, dueDate: "YYYY-MM-DD", transactionDate: "YYYY-MM-DD" }],
  skipped: [{ sourceId, targetMonth, dueDate: "YYYY-MM-DD", reason: "duplicate" }]
}
400 validação    → formato padrão do ValidationPipe
400 transferência → { statusCode: 400, message, transferIds: [...] }
404 não encontrado → { statusCode: 404, message, notFoundIds: [...] }
```

## Decisões

1. Colisão dentro do mesmo lote conta como duplicado (só a primeira cópia é criada).
2. Ids inexistentes e transferências ao mesmo tempo ⇒ 404 prevalece.
3. Corpo de erro com `notFoundIds` / `transferIds` além de `message`.
4. `dryRun` é validado estritamente como boolean (a conversão implícita do ValidationPipe transformaria `"abc"` em `true`).

## Testes

- Unitários: 1 e vários meses, fim de mês (31/01→28/02 e 29/02 bissexto), deslocamento da transactionDate, settled false,
  dryRun não grava, duplicado pulado (banco e lote), 404, 400, rollback quando a 2ª gravação falha.
- Integração: validações do DTO (limites, uuid, YYYY-MM, repetição, dryRun não boolean), fluxo com e sem dryRun, 404 e 400.
