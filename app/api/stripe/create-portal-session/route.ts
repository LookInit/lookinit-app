import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG } from '@/lib/config';
import { getCustomerIdFromUserId } from '@/lib/db';
import { verifyIdToken } from '@/app/api/search-history/auth-utils';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }
    const decoded = await verifyIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
    }

    // Get the customer ID from your database
    const customerId = await getCustomerIdFromUserId(decoded.uid);
    
    if (!customerId) {
      return NextResponse.json({ error: 'No subscription found for this user' }, { status: 404 });
    }

    // Create a Stripe customer portal session
    const baseUrl = CONFIG.baseUrl;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
