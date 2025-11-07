import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, getApiBase } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const res = await fetch(`${getApiBase()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json({ user: data?.user ?? data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
