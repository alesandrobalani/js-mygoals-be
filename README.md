# js-mygoals-be
Um projeto utilizando IA para construção para acompanhar a vida financeira familiar, e buscar a continua evolução para a liberdade financeira.

## Sobre
API backend em NestJS com Clean Architecture para gerenciamento de transações financeiras familiares.

## Estrutura
- `src/domain` - entidades e contratos (repositories)
- `src/use-cases` - casos de uso da aplicação
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
- Testes e2e: `npm run test:e2e`

## Campos da Transação
- **description**: string (obrigatório)
- **amount**: number > 0 (obrigatório)
- **type**: 'income' | 'expense' (obrigatório)
- **category**: enum (Habitação, Serviços públicos, Educação, Saúde, Alimentação, Transporte, Lazer, Cuidados pessoais, Renda Ativa, Renda extra, Renda passiva) (obrigatório)
- **transactionDate**: Date (obrigatório)
- **account**: string (obrigatório)
- **dueDate**: Date (opcional) - se informado, será usado como data da transação; se não informado, será igual à transactionDate

## Regras de Negócio
- Se `dueDate` for informado, `transactionDate` será definido como `dueDate`
- Se `dueDate` não for informado, será definido como `transactionDate`

## Endpoints
- POST `/transactions` - cria transação (body: description, amount, type, category, transactionDate, account, dueDate?)
- GET `/transactions` - lista transações

## Testes com cURL

### Criar uma transação de receita
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Salário mensal",
    "amount": 5000.00,
    "type": "income",
    "category": "Renda Ativa",
    "transactionDate": "2024-01-15",
    "account": "Conta Corrente",
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
    "category": "Serviços públicos",
    "transactionDate": "2024-01-10",
    "account": "Conta Corrente"
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
    "category": "Habitação",
    "transactionDate": "2024-01-01",
    "account": "Cartão Visa",
    "dueDate": "2024-01-15"
  }'
```

## Observações
- Repositório em memória para protótipo.
- Compatível com Node.js >= 18 (testado com 18.20.8).
- Zero vulnerabilidades de segurança!
- Usa NestJS 11.1.18, Jest 29.7.0, TypeScript 5.4.5 para máxima segurança e performance.

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

## Executando testes e2e
- Memória: `npm run test:e2e:memory`
- PostgreSQL: `npm run test:e2e:postgres` (necessita `docker compose up` )

## Migrations
- Migrations executam automaticamente na inicialização quando `DB_MODE=postgres`
- Primeira migração: `1704153600000-CreateTransactionTable.ts`
  - Cria tabela `transactions` com todas as colunas
  - Enums para `type` (income/expense) e `category`
- Para reverter manualmente (dev):
  ```bash
  npx typeorm migration:revert -d dist/database/database.config.js
  ```
