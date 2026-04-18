**Objetivo:** Enquadrar o estilo de código do seu "funcionário robô".

```markdown
# Regras de Engenharia para a IA

- Sempre use tipagem estrita no TypeScript. É proibido o uso de `any`.
- Trate todos os erros usando blocos `try/catch`.
- Para acesso ao banco de dados, sempre utilize os métodos do Prisma Client.
- Nomes de variáveis devem ser em camelCase e em inglês.
- Ao criar rotas, separe a lógica de negócios dentro de um arquivo `Service`, deixando o `Controller` apenas para receber a requisição e devolver a resposta.
