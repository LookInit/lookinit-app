import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const adminAuth = await getAdminAuth();

    // Verify the ID token from the marketing site
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Create a custom token for the same user
    const customToken = await adminAuth.createCustomToken(decoded.uid);

    return NextResponse.json({ customToken });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
