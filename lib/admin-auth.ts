import { verifyIdToken } from '@/app/api/search-history/auth-utils';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'hello@lookinit.com')
  .split(',')
  .map((e) => e.trim().toLowerCase());

export async function requireAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return false;

  const decoded = await verifyIdToken(idToken);
  if (!decoded?.email) return false;

  return ADMIN_EMAILS.includes(decoded.email.toLowerCase());
}
