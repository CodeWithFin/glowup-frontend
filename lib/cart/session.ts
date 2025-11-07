import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const SESSION_COOKIE = 'glowup_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function getSessionId(): string {
  const store = cookies();
  let id = store.get(SESSION_COOKIE)?.value;
  if (!id) {
    id = randomUUID();
    store.set(SESSION_COOKIE, id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_TTL_SECONDS,
    });
  }
  return id;
}

export function refreshSessionCookie() {
  const store = cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return;
  store.set(SESSION_COOKIE, id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
  });
}
