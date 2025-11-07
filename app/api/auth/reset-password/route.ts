import { NextResponse } from 'next/server';
import { getApiBase } from '@/lib/auth';

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ message: 'Token and password required' }, { status: 400 });
  try {
    const res = await fetch(`${getApiBase()}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: 'Unable to reset password' }, { status: 500 });
  }
}
