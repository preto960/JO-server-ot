'use client';

import React, { useState, useEffect } from 'react';
import { Bug, Skull, Heart, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { formatNumber } from '@/lib/vocations';
import type { MonsterInfo } from '@/lib/types';

export default function CreaturesList() {
  const [monsters, setMonsters] = useState<MonsterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/creatures')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setMonsters(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading creatures..." />;

  const filtered = filter
    ? monsters.filter((m) => m.name.toLowerCase().includes(filter.toLowerCase()))
    : monsters;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Bug className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Creatures</h2>
          <Badge variant="outline" className="border-amber-500/20 text-muted-foreground">
            {monsters.length}
          </Badge>
        </div>
        <input
          type="text"
          placeholder="Filter creatures..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs rounded-md border border-amber-500/20 bg-[#1a1a2e] px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/40 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bug className="h-12 w-12" />}
          title="No creatures found"
          description="No creatures match your search."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((monster) => (
            <Card
              key={monster.id}
              className="fantasy-card border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <Skull className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{monster.name}</h3>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-400" />
                        HP: {formatNumber(monster.health)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400" />
                        EXP: {formatNumber(monster.exp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-cyan-400" />
                        Def: {monster.defense}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-gray-400" />
                        Armor: {monster.armor}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {monster.hostile && (
                        <Badge variant="outline" className="border-red-500/20 text-red-400 text-[10px]">
                          Hostile
                        </Badge>
                      )}
                      {monster.summonable && (
                        <Badge variant="outline" className="border-green-500/20 text-green-400 text-[10px]">
                          Summonable
                        </Badge>
                      )}
                      {monster.convinceable && (
                        <Badge variant="outline" className="border-purple-500/20 text-purple-400 text-[10px]">
                          Convinceable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
