import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const DEV_FALLBACK_SECRET = 'insecure-development-only-secret';

/**
 * Resolved per call rather than at import time, so a build does not require the
 * secret to be present, but any token operation in production does.
 *
 * The previous hardcoded fallback meant an unset JWT_SECRET in production signed
 * admin sessions with a constant published in this repository, which anyone could
 * use to mint a valid admin token.
 */
function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set. Refusing to sign or verify admin tokens with a default secret.');
  }

  return DEV_FALLBACK_SECRET;
}

export function signToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('dnr_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
