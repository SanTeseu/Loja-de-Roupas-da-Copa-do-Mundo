
Objetivo: Explicar a regra de negócio para a IA não tomar decisões erradas de lógica.
Markdown

# Requisitos do Produto (PRD)

## Casos de Uso Principais
1. **Listagem de Produtos:** O usuário deve poder ver as camisas filtradas por Seleção (ex: Brasil, Argentina).
2. **Checkout (Compra):** O usuário deve poder comprar uma camisa informando seus dados.

## Regras de Negócio Críticas
- **Controle de Estoque:** É terminantemente proibido vender uma camisa se o `stockQuantity` for zero. O sistema deve retornar um erro HTTP 400 avisando sobre a falta de estoque.
- **Baixa de Estoque:** Ao criar um registro de compra (`Order`), o sistema deve obrigatoriamente subtrair 1 do `stockQuantity` da camisa vendida em uma transação segura (ACID).

