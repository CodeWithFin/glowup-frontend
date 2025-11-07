import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, getApiBase } from '@/lib/auth';
import { mergeCarts } from '@/lib/cart/cart-service';
import { getSessionId } from '@/lib/cart/session';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ message: data?.message || 'Login failed' }, { status: res.status });
    }

    const token = data?.token || data?.accessToken || data?.access_token;
    if (!token) {
      return NextResponse.json({ message: 'Invalid auth response' }, { status: 500 });
    }

    // Set HTTP-only cookie
    const isProd = process.env.NODE_ENV === 'production';
    cookies().set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Merge anonymous session cart into user cart on login
    try {
      const sessionId = getSessionId();
      const userId = (data?.user?.id as string) || (data?.user?.email as string) || 'user-from-token';
      await mergeCarts({ userId, sessionId });
    } catch {
      // non-fatal
    }

    return NextResponse.json({ ok: true, user: data.user ?? null });
  } catch (e) {
    return NextResponse.json({ message: 'Unable to login' }, { status: 500 });
  }
}
