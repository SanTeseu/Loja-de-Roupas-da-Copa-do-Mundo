// =============================================================================
// CheckoutController.ts
// Responsável apenas por receber a requisição e devolver a resposta (AI-RULES.md).
// Toda lógica de negócios fica no CheckoutService.
// =============================================================================

import { Request, Response } from "express";
import { processCheckout } from "../services/CheckoutService";

/**
 * Controller para o endpoint POST /api/checkout
 *
 * Payload esperado (03-api-specs.md):
 *  {
 *    "customerName": "João Silva",
 *    "customerEmail": "joao@email.com",
 *    "jerseyId": "uuid-da-camisa"
 *  }
 *
 * Respostas:
 *  201 — Compra realizada com sucesso
 *  400 — E-mail inválido ou camisa sem estoque
 *  500 — Erro interno inesperado
 */
async function checkout(req: Request, res: Response): Promise<void> {
  try {
    const { customerName, customerEmail, jerseyId } = req.body;

    // Validação básica: campos obrigatórios presentes
    if (!customerName || !customerEmail || !jerseyId) {
      res.status(400).json({
        error: "Campos obrigatórios: customerName, customerEmail e jerseyId.",
      });
      return;
    }

    // Delega ao Service toda a lógica de negócios
    const order = await processCheckout({
      customerName,
      customerEmail,
      jerseyId,
    });

    // 201 Created — retorna os dados da Order criada (03-api-specs.md)
    res.status(201).json({
      message: "Compra realizada com sucesso.",
      order,
    });
  } catch (error: unknown) {
    // Tratamento de erros com try/catch (AI-RULES.md)
    if (error instanceof Error) {
      // Erros de validação de negócio retornam 400
      res.status(400).json({ error: error.message });
      return;
    }

    // Erro inesperado — 500
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export { checkout };
