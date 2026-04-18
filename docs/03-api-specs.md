

Objetivo: Definir como a tela conversa com o servidor.
Markdown

# Especificações da API

## Endpoint: Realizar Compra
- **Rota:** `POST /api/checkout`
- **Descrição:** Processa a compra de uma camisa por um cliente.

### Payload de Envio (Body)
```json
{
"customerName": "João Silva",
"customerEmail": "joao@email.com",
"jerseyId": "uuid-da-camisa"
}
Respostas Esperadas
201 Created: Compra realizada com sucesso. Retorna o ID da Order.
400 Bad Request: Se o email for inválido ou se a camisa estiver sem estoque.

