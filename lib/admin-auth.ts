import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';

function getExpectedToken(): string {
  const secret = process.env.ADMIN_PASSWORD || 'linhanhthaihung2026';
  return crypto.createHash('sha256').update(`wedding_admin_${secret}`).digest('hex');
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === getExpectedToken();
}

export function createAdminToken(): string {
  return getExpectedToken();
}

export { COOKIE_NAME };
