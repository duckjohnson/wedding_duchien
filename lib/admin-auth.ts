import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';

function getExpectedToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null; // chưa đặt ADMIN_PASSWORD => khóa trang admin
  return crypto.createHash('sha256').update(`wedding_admin_${secret}`).digest('hex');
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const expected = getExpectedToken();
  if (!token || !expected) return false;
  return token === expected;
}

export function createAdminToken(): string {
  return getExpectedToken() ?? '';
}

export { COOKIE_NAME };
