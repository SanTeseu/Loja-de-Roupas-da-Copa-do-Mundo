// =============================================================================
// CheckoutService.ts
// Contém toda a lógica de negócios do checkout, conforme AI-RULES.md:
// "Separe a lógica de negócios dentro de um arquivo Service"
// =============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Interface para tipar o payload de entrada — tipagem estrita, sem `any`
interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  jerseyId: string;
}

// Interface para tipar o retorno bem-sucedido
interface CheckoutResult {
  customerId: string;
  jerseyId: string;
  purchaseDate: Date;
}

/**
 * Processa a compra de uma camisa por um cliente.
 *
 * Regras de negócio implementadas (01-product-requirements.md):
 *  1. Verifica se a camisa existe.
 *  2. Verifica se há estoque disponível (stockQuantity > 0).
 *  3. Cria ou reutiliza o Customer pelo email (upsert).
 *  4. Cria o registro de Order e subtrai 1 do stockQuantity
 *     dentro de uma transação ACID (Prisma $transaction).
 *
 * @param input - Dados do checkout (nome, email, ID da camisa)
 * @returns O registro da Order criada
 * @throws Error com mensagem descritiva para erros de validação
 */
async function processCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const { customerName, customerEmail, jerseyId } = input;

  // -----------------------------------------------------------------------
  // Validação: e-mail com formato válido
  // -----------------------------------------------------------------------
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    throw new Error("E-mail inválido.");
  }

  // -----------------------------------------------------------------------
  // Transação ACID — garante integridade entre leitura de estoque,
  // criação do pedido e baixa de estoque (01-product-requirements.md)
  // -----------------------------------------------------------------------
  const order = await prisma.$transaction(async (tx) => {
    // 1. Busca a camisa pelo ID
    const jersey = await tx.jersey.findUnique({
      where: { id: jerseyId },
    });

    if (!jersey) {
      throw new Error("Camisa não encontrada.");
    }

    // 2. Verifica estoque — regra crítica: proibido vender com stockQuantity === 0
    if (jersey.stockQuantity <= 0) {
      throw new Error("Camisa sem estoque disponível.");
    }

    // 3. Cria ou reutiliza o Customer (upsert pelo email único)
    const customer = await tx.customer.upsert({
      where: { email: customerEmail },
      update: { fullName: customerName },
      create: {
        fullName: customerName,
        email: customerEmail,
      },
    });

    // 4. Cria o registro de compra (Order)
    const newOrder = await tx.order.create({
      data: {
        customerId: customer.id,
        jerseyId: jersey.id,
      },
    });

    // 5. Baixa de estoque — subtrai 1 do stockQuantity
    await tx.jersey.update({
      where: { id: jersey.id },
      data: {
        stockQuantity: {
          decrement: 1,
        },
      },
    });

    return newOrder;
  });

  return order;
}

export { processCheckout, CheckoutInput, CheckoutResult };
