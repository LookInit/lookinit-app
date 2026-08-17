import Stripe from 'stripe';

let stripe: Stripe | undefined;

export function getStripeClient(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_API_KEY || 'dummy_key', {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripe;
}
