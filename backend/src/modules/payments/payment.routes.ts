import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new PaymentController();

// POST /api/payments/checkout
router.post('/checkout', authMiddleware, controller.createCheckout);

export default router;
