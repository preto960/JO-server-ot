'use client';

import React, { useState, useEffect } from 'react';
import { Swords, Shield, Heart, Zap, Star, Clock, Skull, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Loading from '@/components/ui/loading';
import { VOCATION_NAMES_EN, SKULL_NAMES, PLAYER_GROUP_NAMES, PLAYER_GROUP_COLORS } from '@/lib/types';
import { getVocationColor, formatNumber, getSkillName } from '@/lib/vocations';
import { formatDistanceToNow } from 'date-fns';

interface PlayerProfileProps {
  name: string;
  onBack?: () => void;
}

export default function PlayerProfile({ name, onBack }: PlayerProfileProps) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    setError('');
    fetch(`/api/players/lookup?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProfile(res.data);
        } else {
          setError(res.error || 'Character not found');
        }
      })
      .catch(() => setError('Failed to load character'))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <Loading text="Loading character..." />;

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

  if (!profile) return null;

  const p = profile as {
    name: string;
    level: number;
    vocation: number;
    experience: number;
    maglevel: number;
    sex: number;
    online: boolean;
    skull: number;
    guildRank?: string;
    guildName?: string;
    skills: Record<number, number>;
    deathCount: number;
    createdAt: string;
    lastLogin: number;
    comment: string;
    balance: number;
    accountName: string;
  };

  const skillEntries = Object.entries(p.skills)
    .filter(([k]) => parseInt(k) >= 1 && parseInt(k) <= 7)
    .sort(([a], [b]) => parseInt(a) - parseInt(b));

  return (
    <div className="space-y-4">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-amber-400"
        >
          ← Back to search
        </Button>
      )}

      {/* Main Info Card */}
      <Card className="fantasy-card gold-glow border-amber-500/20 bg-[#12121f]">
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Swords className="h-8 w-8 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{p.name}</h2>
                {p.online && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Online
                  </Badge>
                )}
                {p.skull > 0 && (
                  <Badge variant="destructive">
                    <Skull className="mr-1 h-3 w-3" />
                    {SKULL_NAMES[p.skull]}
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <span className={getVocationColor(p.vocation)}>
                  {VOCATION_NAMES_EN[p.vocation] || 'Unknown'}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-amber-400 font-semibold">Level {p.level}</span>
              </div>
              {p.guildName && (
                <p className="mt-1 text-sm text-muted-foreground">
                  <Shield className="mr-1 inline h-3 w-3" />
                  {p.guildRank || 'Member'} of{' '}
                  <span className="text-amber-400">{p.guildName}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={<Star className="h-4 w-4" />} label="Experience" value={formatNumber(p.experience)} color="text-amber-400" />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Magic Level" value={p.maglevel.toString()} color="text-purple-400" />
        <StatCard icon={<Heart className="h-4 w-4" />} label="Deaths" value={p.deathCount.toString()} color="text-red-400" />
        <StatCard icon={<User className="h-4 w-4" />} label="Balance" value={`${formatNumber(p.balance)} gp`} color="text-yellow-400" />
      </div>

      {/* Skills */}
      <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {skillEntries.map(([skillId, value]) => (
              <div
                key={skillId}
                className="flex items-center justify-between rounded-md bg-[#1a1a2e] px-3 py-2"
              >
                <span className="text-sm text-muted-foreground">
                  {getSkillName(parseInt(skillId))}
                </span>
                <span className="font-mono font-semibold text-amber-400">
                  {value as number}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <DetailRow label="Sex" value={p.sex === 0 ? 'Male' : 'Female'} />
            <DetailRow label="Account" value={p.accountName} />
            <DetailRow label="Created" value={formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })} />
            <DetailRow
              label="Last Login"
              value={p.lastLogin ? formatDistanceToNow(new Date(p.lastLogin * 1000), { addSuffix: true }) : 'Never'}
            />
            {p.comment && <DetailRow label="Comment" value={p.comment} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
      <CardContent className="p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-md bg-[#1a1a2e] px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
