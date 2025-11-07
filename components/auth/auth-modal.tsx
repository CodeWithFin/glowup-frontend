'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useUIStore();
  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);

  // Sync with store when it changes
  useState(() => {
    setMode(authModalMode);
  });

  const handleClose = () => {
    closeAuthModal();
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {mode === 'signin' ? 'Welcome Back' : 'Join GlowUp'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'signin'
              ? 'Sign in to access your account'
              : 'Create an account to start your beauty journey'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'signin' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 py-4"
          >
            {mode === 'signin' ? (
              <SignInForm />
            ) : (
              <SignUpForm />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center text-sm text-muted-foreground">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SignInForm() {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm">
          <input type="checkbox" className="mr-2" />
          Remember me
        </label>
        <button type="button" className="text-sm text-primary hover:underline">
          Forgot password?
        </button>
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline">
          Google
        </Button>
        <Button type="button" variant="outline">
          Apple
        </Button>
      </div>
    </form>
  );
}

function SignUpForm() {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Jane Doe"
          className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="email-signup" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email-signup"
          type="email"
          placeholder="you@example.com"
          className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="password-signup" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password-signup"
          type="password"
          placeholder="••••••••"
          className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <label className="flex items-start text-sm">
        <input type="checkbox" className="mr-2 mt-0.5" />
        <span className="text-muted-foreground">
          I agree to the{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </span>
      </label>
      <Button type="submit" className="w-full">
        Create Account
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline">
          Google
        </Button>
        <Button type="button" variant="outline">
          Apple
        </Button>
      </div>
    </form>
  );
}
