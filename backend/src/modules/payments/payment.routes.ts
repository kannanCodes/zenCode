import { Router } from 'express';
import express from 'express';
import { PaymentController } from './payment.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { stripeWebhookHandler } from './stripe.webhook';

const router = Router();
const controller = new PaymentController();

// Raw body for Stripe webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// POST /api/payments/checkout
router.post('/checkout', authMiddleware, controller.createCheckout);

export default router;
