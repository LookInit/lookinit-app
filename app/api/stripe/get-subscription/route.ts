export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getUserSubscription } from '@/lib/db';
import { verifyIdToken } from '@/app/api/search-history/auth-utils';

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

    const subscription = await getUserSubscription(decoded.uid);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
