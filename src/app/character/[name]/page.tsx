'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PlayerSearch from '@/components/players/player-search';
import PlayerProfile from '@/components/players/player-profile';

export default function CharacterPage() {
  const router = useRouter();
  const params = useParams();
  const name = params.name as string;

  if (name) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <PlayerProfile
          name={decodeURIComponent(name)}
          onBack={() => router.push('/')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PlayerSearch onSelectPlayer={(playerName) => router.push(`/character/${encodeURIComponent(playerName)}`)} />
    </div>
  );
}
