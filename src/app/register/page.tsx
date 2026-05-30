'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/register-form';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <RegisterForm
        onSuccess={() => router.push('/login')}
        onSwitchToLogin={() => router.push('/login')}
      />
    </div>
  );
}
