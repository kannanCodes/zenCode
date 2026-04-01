import Stripe from 'stripe';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { StripeProductData, CheckoutSessionResult } from './types/payment.types';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError('STRIPE_SECRET_KEY is not configured', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createProductAndPrice(plan: {
    name: string;
    description: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    intervalCount: number;
  }): Promise<StripeProductData> {
    try {
      const product = await this.stripe.products.create({
        name: plan.name,
        description: plan.description,
      });

      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: plan.price * 100, // convert to paise/cents
        currency: 'inr',
        recurring: {
          interval: plan.billingCycle === 'monthly' ? 'month' : 'year',
          interval_count: plan.intervalCount,
        },
      });

      return {
        productId: product.id,
        priceId: price.id,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Stripe product creation failed', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async createCheckoutSession(priceId: string, userId: string): Promise<CheckoutSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new AppError('STRIPE_WEBHOOK_SECRET is not configured', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new AppError('Webhook signature verification failed', STATUS_CODES.BAD_REQUEST);
    }
  }

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
  }

  // Cancel at period end (not immediate) — user keeps access until billing period ends
  async cancelStripeSubscription(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // Upgrade or downgrade plan — Stripe prorates automatically
  async upgradeSubscription(stripeSubscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }
}
