# Exemplos de cURL

Exemplos de requisições para testar a API localmente em `http://localhost:3000`.

## Autenticação

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

## Transações

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

## Categorias

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

## Contas

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

## Itens de Transação

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
