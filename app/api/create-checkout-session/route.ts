export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { CONFIG } from '@/lib/config';
import { verifyIdToken } from '@/app/api/search-history/auth-utils';

const stripe = getStripeClient();

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }
    const decoded = await verifyIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
    }
    const userId = decoded.uid;

    const { planId, source } = await req.json();

    // Define price IDs for each plan using config
    const priceIds: Record<string, string> = {
      basic: CONFIG.stripe.basicPriceId,
      pro: CONFIG.stripe.proPriceId,
    };
    
    if (!priceIds[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Derive base URL from host header — always correct in dev and prod
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceIds[planId], // Use the price ID from config
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pro/cancel?plan=${planId}`,
      metadata: {
        userId,
        planId,
        source: source || 'website',
      },
      customer_email: decoded.email || undefined,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
