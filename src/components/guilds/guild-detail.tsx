'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Crown, Users, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Loading from '@/components/ui/loading';
import { VOCATION_NAMES_EN } from '@/lib/types';
import { getVocationColor } from '@/lib/vocations';
import { formatDistanceToNow } from 'date-fns';

interface GuildDetailProps {
  name: string;
  onBack?: () => void;
}

interface GuildDetailData {
  guild: {
    id: number;
    name: string;
    ownerName: string;
    motd: string;
    description: string;
    logoGfxName: string;
    memberCount: number;
    creationData: string;
  };
  ranks: {
    id: number;
    name: string;
    level: number;
    members: {
      playerName: string;
      rankName: string;
      level: number;
      vocation: number;
      online: boolean;
    }[];
  }[];
}

export default function GuildDetail({ name, onBack }: GuildDetailProps) {
  const [data, setData] = useState<GuildDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    fetch(`/api/guilds/lookup?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.error || 'Guild not found');
      })
      .catch(() => setError('Failed to load guild'))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <Loading text="Loading guild..." />;
  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">{error}</p>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4 border-amber-500/20">
            Go Back
          </Button>
        )}
      </div>
    );
  }
  if (!data) return null;

  const totalOnline = data.ranks.reduce(
    (sum, r) => sum + r.members.filter((m) => m.online).length,
    0
  );

  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-amber-400">
          ← Back to guilds
        </Button>
      )}

      <Card className="fantasy-card gold-glow border-amber-500/20 bg-[#12121f]">
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-amber-500/10">
              <Crown className="h-8 w-8 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{data.guild.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Led by <span className="text-amber-400">{data.guild.ownerName}</span> •{' '}
                {data.guild.memberCount} members • {totalOnline} online
              </p>
              {data.guild.motd && (
                <p className="mt-2 rounded-md bg-[#1a1a2e] p-2 text-sm italic text-muted-foreground">
                  &ldquo;{data.guild.motd}&rdquo;
                </p>
              )}
            </div>
          </div>
          {data.guild.description && (
            <p className="mt-4 text-sm text-muted-foreground">{data.guild.description}</p>
          )}
        </CardContent>
      </Card>

      {data.ranks.map((rank) => (
        <Card key={rank.id} className="fantasy-card border-amber-500/10 bg-[#12121f]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-amber-500" />
              {rank.name}
              <Badge variant="outline" className="ml-auto border-amber-500/20 text-muted-foreground">
                {rank.members.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rank.members.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No members in this rank.</p>
            ) : (
              <div className="space-y-1">
                {rank.members
                  .sort((a, b) => b.level - a.level)
                  .map((member) => (
                    <div
                      key={member.playerName}
                      className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-amber-500/5"
                    >
                      <div className="flex items-center gap-2">
                        {member.online ? (
                          <div className="h-2 w-2 rounded-full bg-green-400" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {member.playerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={getVocationColor(member.vocation)}>
                          {VOCATION_NAMES_EN[member.vocation] || 'Unknown'}
                        </span>
                        <span className="font-mono text-amber-400">Lv {member.level}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
