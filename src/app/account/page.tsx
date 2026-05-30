'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountPanel from '@/components/auth/account-panel';
import Loading from '@/components/ui/loading';

export default function AccountPage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setLoggedIn(data.success))
      .catch(() => setLoggedIn(false));
  }, []);

  if (loggedIn === null) return <Loading text="Verificando sesión..." />;

  if (!loggedIn) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg text-muted-foreground">Debes iniciar sesión para ver tu cuenta.</p>
        <button
          onClick={() => router.push('/login')}
          className="rounded-md bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <AccountPanel
        onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/');
        }}
        onNavigate={(page) => router.push(`/${page}`)}
      />
    </div>
  );
}
