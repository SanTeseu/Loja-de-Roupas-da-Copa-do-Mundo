import request from 'supertest';
import express from 'express';
import { checkout } from './CheckoutController';
import * as CheckoutService from '../services/CheckoutService';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
  },
}));

jest.mock('../services/CheckoutService');

describe('CheckoutController', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/checkout', checkout);
    jest.clearAllMocks();
  });

  describe('POST /api/checkout', () => {
    it('should return 400 if customerName is missing', async () => {
      const res = await request(app).post('/api/checkout').send({
        customerEmail: 'john@example.com',
        jerseyId: 'jersey-123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Campos obrigatórios');
    });

    it('should return 400 if customerEmail is missing', async () => {
      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        jerseyId: 'jersey-123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Campos obrigatórios');
    });

    it('should return 400 if jerseyId is missing', async () => {
      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Campos obrigatórios');
    });

    it('should return 400 if email is invalid', async () => {
      (CheckoutService.processCheckout as jest.Mock).mockRejectedValueOnce(
        new Error('E-mail inválido.')
      );

      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        customerEmail: 'invalid-email',
        jerseyId: 'jersey-123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('E-mail inválido.');
    });

    it('should return 400 if jersey not found', async () => {
      (CheckoutService.processCheckout as jest.Mock).mockRejectedValueOnce(
        new Error('Camisa não encontrada.')
      );

      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'nonexistent-id',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Camisa não encontrada.');
    });

    it('should return 400 if jersey is out of stock', async () => {
      (CheckoutService.processCheckout as jest.Mock).mockRejectedValueOnce(
        new Error('Camisa sem estoque disponível.')
      );

      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'jersey-123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Camisa sem estoque disponível.');
    });

    it('should return 201 and order data on successful checkout', async () => {
      const mockOrder = {
        customerId: 'customer-123',
        jerseyId: 'jersey-123',
        purchaseDate: new Date().toISOString(),
      };

      (CheckoutService.processCheckout as jest.Mock).mockResolvedValueOnce(
        mockOrder
      );

      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'jersey-123',
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Compra realizada com sucesso.');
      expect(res.body.order).toEqual(mockOrder);
    });

    it('should return 500 on unexpected error', async () => {
      (CheckoutService.processCheckout as jest.Mock).mockRejectedValueOnce(
        new Error('Unexpected database error')
      );

      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'jersey-123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Unexpected database error');
    });

    it('should handle non-Error exceptions gracefully', async () => {
      (CheckoutService.processCheckout as jest.Mock).mockRejectedValueOnce(
        'Some unexpected error'
      );

      const res = await request(app).post('/api/checkout').send({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        jerseyId: 'jersey-123',
      });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Erro interno do servidor.');
    });
  });
});
