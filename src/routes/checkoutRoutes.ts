// =============================================================================
// checkoutRoutes.ts
// Define a rota POST /api/checkout conforme 03-api-specs.md
// =============================================================================

import { Router } from "express";
import { checkout } from "../controllers/CheckoutController";

const router = Router();

// POST /api/checkout — Processa a compra de uma camisa
router.post("/checkout", checkout);

export default router;
