import { cookies } from 'next/headers';
import { AUTH_COOKIE } from '@/lib/auth';

export default function ProfilePage() {
  // This page is protected by middleware; at runtime you would fetch real user data
  const token = cookies().get(AUTH_COOKIE)?.value;
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-muted-foreground">This area is accessible only when authenticated.</p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Auth token present: {token ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
