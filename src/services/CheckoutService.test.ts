import { processCheckout, CheckoutInput } from './CheckoutService';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    jersey: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      upsert: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
  },
}));

describe('CheckoutService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = require('../lib/prisma').default;
  });

  describe('processCheckout', () => {
    it('should validate email format', async () => {
      const invalidInput: CheckoutInput = {
        customerName: 'John Doe',
        customerEmail: 'invalid-email',
        jerseyId: 'jersey-123',
      };

      await expect(processCheckout(invalidInput)).rejects.toThrow(
        'E-mail inválido.'
      );
    });

    it('should throw error if jersey not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          jersey: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      const input: CheckoutInput = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'nonexistent-id',
      };

      await expect(processCheckout(input)).rejects.toThrow(
        'Camisa não encontrada.'
      );
    });

    it('should throw error if jersey out of stock', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          jersey: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'jersey-123',
              stockQuantity: 0,
            }),
          },
        });
      });

      const input: CheckoutInput = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'jersey-123',
      };

      await expect(processCheckout(input)).rejects.toThrow(
        'Camisa sem estoque disponível.'
      );
    });

    it('should successfully process checkout', async () => {
      const mockOrder = {
        customerId: 'customer-123',
        jerseyId: 'jersey-123',
        purchaseDate: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          jersey: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'jersey-123',
              stockQuantity: 5,
            }),
            update: jest.fn().mockResolvedValue({
              id: 'jersey-123',
              stockQuantity: 4,
            }),
          },
          customer: {
            upsert: jest.fn().mockResolvedValue({
              id: 'customer-123',
              fullName: 'John Doe',
              email: 'john@example.com',
            }),
          },
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
        });
      });

      const input: CheckoutInput = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'jersey-123',
      };

      const result = await processCheckout(input);

      expect(result.customerId).toBe('customer-123');
      expect(result.jerseyId).toBe('jersey-123');
      expect(result.purchaseDate).toBeDefined();
    });
  });
});
