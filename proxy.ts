import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];
function getSecret() {
  const value = String(process.env.JWT_SECRET || '').trim();
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not set. Refusing to verify admin sessions with a default secret.');
    }
    return new TextEncoder().encode('insecure-development-only-secret');
  }
  return new TextEncoder().encode(value);
}

async function isValid(token?: string) {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const token = req.cookies.get('dnr_token')?.value;
    const valid = await isValid(token);
    if (!valid) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
