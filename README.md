# js-mygoals-be
Um projeto utilizando IA para construção para acompanhar a vida financeira familiar, e buscar a continua evolução para a liberdade financeira.

## Sobre
API backend em NestJS com Clean Architecture para gerenciamento de transações financeiras familiares.

## Estrutura
- `src/domain` - entidades e contratos (repositories)
- `src/use-cases` - casos de uso da aplicação (accounts, categories, transactions, transaction-items)
- `src/infrastructure` - implementações de persistência e infra
- `src/modules` - controllers e modules do Nest
- `src/dto` - objetos de transferência de dados e validações

## Rodando
1. `npm install`
2. `npm run start:dev`

API padrão: `http://localhost:3000`

## Testes
- Testes unitários: `npm test`
- Testes de integração: `npm run test:integration`

## Campos da Transação
- **description**: string (obrigatório)
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

## Endpoints
- POST `/transactions` - cria transação (body: description, amount, type, categoryId, transactionItemId, transactionDate, accountId, dueDate?)
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

### Criar uma transação de receita
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
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
  -d '{
    "description": "Conta de luz",
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
curl -X GET http://localhost:3000/transactions
```

### Criar transação com data de vencimento diferente
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
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
curl -X GET http://localhost:3000/categories
```

### Criar uma nova categoria
```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Investimentos",
    "description": "Aplicações financeiras e investimentos"
  }'
```

### Listar todas as contas
```bash
curl -X GET http://localhost:3000/accounts
```

### Criar uma nova conta
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conta Corrente",
    "description": "Conta corrente do banco principal"
  }'
```

### Listar todos os itens de transação
```bash
curl -X GET http://localhost:3000/transaction-items
```

### Criar um novo item de transação
```bash
curl -X POST http://localhost:3000/transaction-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salário",
    "description": "Renda mensal do trabalho"
  }'
```

### Atualizar um item de transação
```bash
curl -X PUT http://localhost:3000/transaction-items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salário Atualizado",
    "description": "Renda mensal atualizada"
  }'
```

### Remover um item de transação
```bash
curl -X DELETE http://localhost:3000/transaction-items/1
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
- Para reverter manualmente (dev):
  ```bash
  npx typeorm migration:revert -d dist/database/database.config.js
  ```
