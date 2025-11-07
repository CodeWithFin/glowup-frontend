import { NextResponse } from 'next/server';
import { getApiBase } from '@/lib/auth';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });
  try {
    const res = await fetch(`${getApiBase()}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: 'Unable to process request' }, { status: 500 });
  }
}
