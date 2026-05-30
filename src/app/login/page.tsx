'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <LoginForm
        onSuccess={() => router.push('/account')}
        onSwitchToRegister={() => router.push('/register')}
      />
    </div>
  );
}
