import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, getApiBase } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${getApiBase()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ message: data?.message || 'Registration failed' }, { status: res.status });
    }

    const token = data?.token || data?.accessToken || data?.access_token;
    if (token) {
      const isProd = process.env.NODE_ENV === 'production';
      cookies().set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({ ok: true, user: data.user ?? null });
  } catch (e) {
    return NextResponse.json({ message: 'Unable to register' }, { status: 500 });
  }
}
