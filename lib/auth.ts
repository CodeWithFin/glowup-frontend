import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'glowup_token';

export type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
};

export function getAuthToken() {
  try {
    return cookies().get(AUTH_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

export function getApiBase() {
  const api = process.env.AUTH_API_URL;
  if (!api) throw new Error('Missing AUTH_API_URL');
  return api.replace(/\/$/, '');
}
