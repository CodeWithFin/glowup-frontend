import { getAuthToken } from './auth';

export function getAdminUserIds(): string[] {
  const raw = process.env.ADMIN_USER_IDS || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function isAdmin(userId?: string): boolean {
  if (!userId) return false;
  const adminIds = getAdminUserIds();
  return adminIds.includes(userId);
}

export function requireAdmin(userId?: string): void {
  if (!isAdmin(userId)) {
    throw new Error('Forbidden: Admin access required');
  }
}

// Helper to extract userId from token (placeholder - extend with real JWT decode)
export function getUserIdFromToken(): string | undefined {
  const token = getAuthToken();
  if (!token) return undefined;
  // TODO: decode JWT and extract user.id
  // For now, return a placeholder
  return 'user-from-token';
}
