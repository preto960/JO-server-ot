'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import GuildList from '@/components/guilds/guild-list';
import GuildDetail from '@/components/guilds/guild-detail';

export default function GuildsPage() {
  const router = useRouter();
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);

  if (selectedGuild) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <GuildDetail
          name={selectedGuild}
          onBack={() => setSelectedGuild(null)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <GuildList onSelectGuild={(name) => setSelectedGuild(name)} />
    </div>
  );
}
