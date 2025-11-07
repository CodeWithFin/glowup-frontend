import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, getApiBase } from '@/lib/auth';

export async function POST() {
  try {
    // Optional: Inform backend to invalidate token/session
    const token = cookies().get(AUTH_COOKIE)?.value;
    if (token) {
      try {
        await fetch(`${getApiBase()}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  } finally {
    cookies().set(AUTH_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
  }

  return NextResponse.json({ ok: true });
}
