'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Crown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { VOCATION_NAMES_EN, type GuildInfo } from '@/lib/types';
import { getVocationColor } from '@/lib/vocations';
import { formatDistanceToNow } from 'date-fns';

interface GuildListProps {
  onSelectGuild?: (name: string) => void;
}

export default function GuildList({ onSelectGuild }: GuildListProps) {
  const [guilds, setGuilds] = useState<GuildInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/guilds')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setGuilds(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading guilds..." />;

  if (guilds.length === 0) {
    return (
      <EmptyState
        icon={<Shield className="h-12 w-12" />}
        title="No guilds found"
        description="There are no guilds on the server yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground">Guilds</h2>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500">
          {guilds.length}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {guilds.map((guild) => (
          <Card
            key={guild.id}
            className="fantasy-card cursor-pointer border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25"
            onClick={() => onSelectGuild?.(guild.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                    <Crown className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground hover:text-amber-400 transition-colors">
                      {guild.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Founded {formatDistanceToNow(new Date(guild.creationData), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {guild.memberCount} member{guild.memberCount !== 1 ? 's' : ''}
                </span>
                <span>Leader: {guild.ownerName}</span>
              </div>
              {guild.description && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground/70">
                  {guild.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
