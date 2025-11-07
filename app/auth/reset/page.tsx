'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');

  const form = useForm<{ password: string }>({ resolver: zodResolver(schema), defaultValues: { password: '' } });

  const onSubmit = async (values: { password: string }) => {
    if (!token) {
      toast({ title: 'Invalid link', description: 'Missing reset token', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: values.password }),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: 'Password reset', description: 'You can now sign in with your new password.' });
      router.replace('/auth/login');
    } else {
      const data = await res.json().catch(() => ({}));
      toast({ title: 'Reset failed', description: data?.message ?? 'Try again later', variant: 'destructive' });
    }
  };

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
