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

## Endpoints
- POST `/transactions` - cria transação
- GET `/transactions` - lista transações

## Observações
- Repositório em memória para protótipo.
- Atualizar Node para >= 18 para melhor compatibilidade com Jest e ferramentas modernas.
