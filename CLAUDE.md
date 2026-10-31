# MyGoals — Backend (js-mygoals-be)

API de gestão financeira familiar. NestJS 11 + TypeORM + PostgreSQL, organizada em Clean Architecture.
O frontend é o repositório irmão `../js-mygoals-fe` (ver `../js-mygoals-fe/CLAUDE.md`), que espelha os DTOs em `src/types/index.ts`.

## Comandos

- `npm test` — testes unitários (Jest, `*.spec.ts`). Use `npx jest <padrão>` para filtrar.
- `npm run test:integration` — testes de integração HTTP (`src/integration/*.integration.spec.ts`, supertest).
- `npm run build` — `tsc -p tsconfig.build.json`. Rode antes de concluir: pega erros de tipo.
- `npm run lint` — ESLint (com `--fix`).
- `npm run start:dev` — servidor em http://localhost:3000. `docker compose up` sobe o Postgres.
- `DB_MODE=postgres` usa Postgres; caso contrário a app sobe com better-sqlite3.

Definição de pronto: `npm test`, `npm run test:integration` e `npm run build` passando.

## Arquitetura (onde cada coisa vai)

- `src/domain/entities` — entidades de domínio (classes puras, sem decorators do TypeORM).
- `src/domain/repositories` — interfaces/abstrações de repositório.
- `src/infrastructure/persistence/postgresql` — `*.entity.ts` (TypeORM) e `PostgreSQL*Repository` (implementações + mapeamento entity ⇄ domínio).
- `src/use-cases/<recurso>/<acao>.usecase.ts` — uma classe por caso de uso com `execute(...)`; regra de negócio fica aqui, não no controller.
- `src/dto` — DTOs de entrada com `class-validator`. **Mudou um DTO/resposta ⇒ atualize `../js-mygoals-fe/src/types/index.ts`.**
- `src/modules/<recurso>` — controller + module (registra use cases). Repositórios são providos por token string em `src/modules/database/database.module.ts` (ex.: `'AccountRepository'`).
- `src/auth` — JWT guard global, `@Public()`, `@Roles()`, `@CurrentUser()`.
- `src/database/migrations` — nome `17041536000NN-DescricaoEmPascal.ts`, numeração sequencial (próxima = último + 1). Nunca edite migration já existente; crie outra.

## Testes

- Unitários ao lado do use case: `src/use-cases/<recurso>/<acao>.usecase.spec.ts`, usando SQLite real via `createTestDataSource()` / `createTestRepositories()` de `src/test-utils/test-datasource.ts` (sem mocks de repositório). Limpe as tabelas no `beforeEach`.
- Integração: `src/integration/*.integration.spec.ts`, sobem um `Test*Module` (`src/modules/<recurso>/test-<recurso>.module.ts`) com `sqlite-database.module.ts`.
- Toda feature cobre **happy flow e bad flow** (validação, not found, regras de negócio, autorização).

## Fluxo de features

- Cada feature tem `specifications/NN-nome/` com o pedido original. Use `/feature NN-nome` para implementá-la.
- Mantenha atualizados `README.md` e `CURL_EXAMPLES.md` quando endpoints mudarem.

## Git

- Branches `feature/<nome-curto>` a partir de `main`; PR para `main`.
- Mensagens de commit em português, curtas.
- Arquivos em UTF-8 **sem BOM** (há specs com acentuação corrompida — não propague).
- Não versione `logs/`, `*-audit.json`, `*.tsbuildinfo`.
