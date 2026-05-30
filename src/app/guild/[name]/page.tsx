'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import GuildDetail from '@/components/guilds/guild-detail';
import { useRouter } from 'next/navigation';

export default function GuildDetailPage() {
  const router = useRouter();
  const params = useParams();
  const name = decodeURIComponent(params.name as string);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <GuildDetail
        name={name}
        onBack={() => router.push('/guilds')}
      />
    </div>
  );
}
