---
name: feature
description: Implementa uma feature do backend MyGoals a partir de uma pasta em specifications/ (planeja, implementa em Clean Architecture, testa e atualiza a documentação).
argument-hint: <NN-nome-da-spec>
disable-model-invocation: true
---

Implemente a feature descrita em `specifications/$ARGUMENTS/`.

## 1. Entender
- Leia **todos** os arquivos de `specifications/$ARGUMENTS/` em ordem. Os posteriores refinam os anteriores.
- Leia as entidades, repositórios, use cases e controllers que serão tocados.

## 2. Planejar
- Apresente um plano curto: migration (se houver), entidade de domínio, entity TypeORM, interface + implementação de repositório, use case(s), DTO(s), controller/module, testes e docs.
- Descreva o **contrato HTTP** (método, rota, query/body, resposta, erros) — o frontend vai consumir exatamente isso.
- Liste dúvidas reais de requisito. Aguarde aprovação antes de codar.
- Após aprovado, salve o plano em `specifications/$ARGUMENTS/plan.md`.

## 3. Implementar
Siga o `CLAUDE.md`: regra de negócio no use case, DTOs com class-validator, repositório por token no `DatabaseModule`, migration nova com o próximo número sequencial (nunca editar as existentes).

## 4. Testar
- Unitário `*.usecase.spec.ts` (SQLite via `test-utils/test-datasource.ts`) e integração em `src/integration/` — happy e bad flows.
- Rode `npm test`, `npm run test:integration` e `npm run build`. Corrija até passar. Não pule testes.

## 5. Documentar e reportar
- Atualize `README.md` e `CURL_EXAMPLES.md`.
- Se o contrato mudou, liste os ajustes necessários em `../js-mygoals-fe/src/types/index.ts` e services do frontend (ou faça-os, se pedido).
- Resuma o que foi feito e o resultado dos comandos. Não faça commit sem pedido explícito.
