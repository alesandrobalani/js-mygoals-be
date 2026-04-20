# js-mygoals-be
Um projeto utilizando IA para construção para acompanhar a vida financeira familiar, e buscar a continua evolução para a liberdade financeira.

## Sobre
API backend em NestJS com Clean Architecture para gerenciamento de transações financeiras familiares.

## Estrutura
- `src/domain` - entidades e contratos (repositories)
- `src/use-cases` - casos de uso da aplicação (accounts, categories, transactions, transaction-items, auth)
- `src/infrastructure` - implementações de persistência e infra
- `src/modules` - controllers e modules do Nest
- `src/auth` - estratégias JWT, guards e decorators de autenticação
- `src/dto` - objetos de transferência de dados e validações

## Rodando
1. `npm install`
2. `npm run start:dev`

API padrão: `http://localhost:3000`

## Testes
- Testes unitários: `npm test`
- Testes de integração: `npm run test:integration`

## Campos da Transação
- **description**: string (opcional)
- **amount**: number > 0 (obrigatório)
- **type**: 'income' | 'expense' (obrigatório)
- **categoryId**: string (obrigatório)
- **transactionItemId**: string (obrigatório)
- **transactionDate**: Date (obrigatório)
- **accountId**: string (obrigatório)
- **dueDate**: Date (opcional) - se informado, será usado como data da transação; se não informado, será igual à transactionDate

## Regras de Negócio
- Se `dueDate` for informado, `transactionDate` será definido como `dueDate`
- Se `dueDate` não for informado, será definido como `transactionDate`
- Itens de transação têm nomes únicos
- Não é possível remover um item de transação se houver transações associadas a ele

## Autenticação e Autorização

A API utiliza JWT (JSON Web Tokens) com refresh token rotation e controle de acesso baseado em papéis (RBAC).

### Papéis de usuário

| Papel | Descrição |
|-------|-----------|
| `admin` | Administrador — pode criar novos usuários e acessar todos os recursos |
| `user` | Usuário comum — pode acessar os recursos financeiros (transações, contas, categorias, itens) |

### Usuário admin padrão (seed)
- **Email:** `admin@mygoals.com`
- **Senha:** `Admin@12345`
- ⚠️ Troque a senha após o primeiro login em produção.

### Fluxo
1. `POST /auth/login` (público) → obtém `accessToken` (JWT com `role`, 15 min) e `refreshToken` (UUID, 7 dias)
2. Use o `accessToken` no header `Authorization: Bearer` para acessar endpoints protegidos
3. Quando o `accessToken` expirar, use `POST /auth/refresh` para obter novos tokens
4. Cada refresh token é de uso único (rotation)

### Segurança
- Senhas armazenadas com bcrypt (12 salt rounds)
- Role do usuário embutida no JWT — verificada a cada requisição
- Guards JWT e RBAC globais aplicados a todas as rotas
- Refresh tokens armazenados no banco e invalidados após uso

### Variáveis de ambiente obrigatórias
- `JWT_SECRET` — segredo para assinar os JWTs (**obrigatório em produção**)

## Endpoints

### Auth (públicos — sem token)
- `POST /auth/login` - autentica e retorna tokens (body: email, password)
- `POST /auth/refresh` - renova tokens (body: refreshToken)

### Auth (somente `admin`)
- `POST /auth/register` - cria novo usuário (body: email, password, name, role?)

### Auth (qualquer usuário autenticado)
- `POST /auth/logout` - revoga refresh token (body: refreshToken)
- `GET /auth/me` - retorna dados do usuário autenticado

### Recursos financeiros (roles `user` e `admin`)
- POST `/transactions` - cria transação (body: description?, amount, type, categoryId, transactionItemId, transactionDate, accountId, dueDate?)
- GET `/transactions` - lista transações
- POST `/categories` - cria categoria (body: name, description?)
- GET `/categories` - lista categorias
- POST `/accounts` - cria conta (body: name, description?)
- GET `/accounts` - lista contas
- POST `/transaction-items` - cria item de transação (body: name, description?)
- GET `/transaction-items` - lista itens de transação
- GET `/transaction-items/:id` - obtém item de transação por ID
- PUT `/transaction-items/:id` - atualiza item de transação (body: name?, description?)
- DELETE `/transaction-items/:id` - remove item de transação

## Testes com cURL

### Login como admin (primeiro acesso)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mygoals.com",
    "password": "Admin@12345"
  }'
```

### Registrar um novo usuário (somente admin)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-do-admin>" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha1234",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha1234"
  }'
```
Resposta: `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`

### Renovar tokens (refresh)
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<seu-refresh-token>"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <seu-access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<seu-refresh-token>"
  }'
```

### Obter usuário autenticado
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <seu-access-token>"
```

### Criar uma transação de receita
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-access-token>" \
  -d '{
    "description": "Salário mensal",
    "amount": 5000.00,
    "type": "income",
    "categoryId": "9",
    "transactionItemId": "1",
    "transactionDate": "2024-01-15",
    "accountId": "1",
    "dueDate": "2024-01-15"
  }'
```

### Criar uma transação de despesa
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-access-token>" \
  -d '{
    "amount": 150.50,
    "type": "expense",
    "categoryId": "2",
    "transactionItemId": "2",
    "transactionDate": "2024-01-10",
    "accountId": "1"
  }'
```

### Listar todas as transações
```bash
curl -X GET http://localhost:3000/transactions \
  -H "Authorization: Bearer <seu-access-token>"
```

### Criar transação com data de vencimento diferente
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-access-token>" \
  -d '{
    "description": "Cartão de crédito",
    "amount": 200.00,
    "type": "expense",
    "categoryId": "1",
    "transactionItemId": "3",
    "transactionDate": "2024-01-01",
    "accountId": "2",
    "dueDate": "2024-01-15"
  }'
```

### Listar todas as categorias
```bash
curl -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer <seu-access-token>"
```

### Criar uma nova categoria
```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-access-token>" \
  -d '{
    "name": "Investimentos",
    "description": "Aplicações financeiras e investimentos"
  }'
```

### Listar todas as contas
```bash
curl -X GET http://localhost:3000/accounts \
  -H "Authorization: Bearer <seu-access-token>"
```

### Criar uma nova conta
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-access-token>" \
  -d '{
    "name": "Conta Corrente",
    "description": "Conta corrente do banco principal"
  }'
```

### Listar todos os itens de transação
```bash
curl -X GET http://localhost:3000/transaction-items \
  -H "Authorization: Bearer <seu-access-token>"
```

### Criar um novo item de transação
```bash
curl -X POST http://localhost:3000/transaction-items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-access-token>" \
  -d '{
    "name": "Salário",
    "description": "Renda mensal do trabalho"
  }'
```

### Atualizar um item de transação
```bash
curl -X PUT http://localhost:3000/transaction-items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-access-token>" \
  -d '{
    "name": "Salário Atualizado",
    "description": "Renda mensal atualizada"
  }'
```

### Remover um item de transação
```bash
curl -X DELETE http://localhost:3000/transaction-items/1 \
  -H "Authorization: Bearer <seu-access-token>"
```

## Otimizações de Performance
- **Particionamento**: Tabela `transactions` particionada por ano usando `dueDate` para melhor performance em consultas históricas
- **Índices**:
  - `idx_transactions_transaction_item_id` - consultas por item de transação
  - `idx_transactions_account_id` - consultas por conta
  - `idx_transactions_category_id` - consultas por categoria
  - `idx_transactions_due_date_type` - consultas compostas por data de vencimento e tipo

## Docker (desenvolvimento)
1. `docker compose up --build`
2. A API sobe em `http://localhost:3000`

### PostgreSQL via Docker
- `DB_MODE=postgres`
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=password`
- `DB_DATABASE=js_mygoals_be`
- `JWT_SECRET=<segredo-forte-aqui>` (**obrigatório em produção**)

## Migrations
- Migrations executam automaticamente na inicialização quando `DB_MODE=postgres`
- Primeira migração: `1704153600000-CreateTransactionTable.ts`
  - Cria tabela `transactions` com todas as colunas
  - Enums para `type` (income/expense) e `category`
- Segunda migração: `1704153600001-CreateAccountTable.ts`
  - Cria tabela `accounts`
- Terceira migração: `1704153600002-CreateCategoryTable.ts`
  - Cria tabela `categories`
- Quarta migração: `1704153600003-SeedDefaultCategories.ts`
  - Insere categorias padrão
- Quinta migração: `1704153600004-CreateTransactionItemTable.ts`
  - Cria tabela `transaction_items`
  - Adiciona coluna `transactionItemId` à tabela `transactions`
- Sexta migração: `1704153600005-OptimizeTransactionTable.ts`
  - Converte tabela `transactions` para particionada por ano (usando `dueDate`)
  - Cria índices de consulta por `transactionItemId`, `accountId`, `categoryId` e composto `(dueDate, type)`
- Sétima migração: `1704153600006-MakeTransactionDescriptionOptional.ts`
  - Torna o campo `description` da tabela `transactions` opcional (nullable)
- Oitava migração: `1704153600007-CreateUserTable.ts`
  - Cria tabela `users` (id UUID, email único, passwordHash, name)
  - Índice em `email` para performance no login
- Nona migração: `1704153600008-CreateRefreshTokenTable.ts`
  - Cria tabela `refresh_tokens` (id UUID, token único, userId FK, expiresAt, revokedAt)
  - Índices em `token` e `userId`
  - Cascade delete ao remover usuário
- Para reverter manualmente (dev):
  ```bash
  npx typeorm migration:revert -d dist/database/database.config.js
  ```
