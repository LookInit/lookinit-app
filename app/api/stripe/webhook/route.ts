export const runtime = "nodejs";
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe';
import { upsertUserSubscription, updateUserSubscriptionStatus } from '@/lib/db';
import { Redis } from '@upstash/redis';
import { subTierKey } from '@/lib/subscription-tiers';

// Check if we're in the build phase
const isBuildPhase = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

const stripe = getStripeClient();

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'dummy_secret';

export async function POST(request: Request) {
  // Skip during build phase
  if (isBuildPhase) {
    return NextResponse.json({ received: true });
  }
  
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log(`⚠️ Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const { userId, planId } = await getMetadataFromSubscription(subscription);

        if (userId) {
          const resolvedPlanId = planId || 'basic';
          const redis = Redis.fromEnv();
          await Promise.all([
            upsertUserSubscription({
              userId,
              customerId: subscription.customer as string,
              subscriptionId: subscription.id,
              status: subscription.status,
              planId: resolvedPlanId,
              currentPeriodEnd: subscription.current_period_end,
              createdAt: subscription.created,
            }),
            // Cache tier in Redis for fast edge-compatible rate limit lookups
            subscription.status === 'active'
              ? redis.set(subTierKey(userId), resolvedPlanId)
              : redis.del(subTierKey(userId)),
          ]);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const { userId: deletedUserId } = await getMetadataFromSubscription(deletedSubscription);

        if (deletedUserId) {
          const redis = Redis.fromEnv();
          await Promise.all([
            updateUserSubscriptionStatus(deletedUserId, 'canceled'),
            redis.del(subTierKey(deletedUserId)),
          ]);
        }
        break;
      }
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Helper to extract userId and planId from a subscription via metadata or linked checkout session
async function getMetadataFromSubscription(
  subscription: Stripe.Subscription
): Promise<{ userId: string | null; planId: string | null }> {
  try {
    // Check subscription metadata first
    if (subscription.metadata?.userId) {
      return {
        userId: subscription.metadata.userId,
        planId: subscription.metadata.planId || null,
      };
    }

    // Fall back to the checkout session that created this subscription
    const sessions = await stripe.checkout.sessions.list({
      subscription: subscription.id,
      expand: ['data.metadata'],
    });

    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      return {
        userId: session.metadata?.userId || null,
        planId: session.metadata?.planId || null,
      };
    }

    return { userId: null, planId: null };
  } catch (error) {
    console.error('Error getting metadata from subscription:', error);
    return { userId: null, planId: null };
  }
}
