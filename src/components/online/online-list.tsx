'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Wifi, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { VOCATION_NAMES_EN, type OnlinePlayer } from '@/lib/types';
import { getVocationColor } from '@/lib/vocations';

export default function OnlineList() {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [count, setCount] = useState(0);
  const [record, setRecord] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/online');
      const data = await res.json();
      if (data.success) {
        setPlayers(data.data.players);
        setCount(data.data.count);
        setRecord(data.data.record);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <Loading text="Loading online players..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Players Online
          </h2>
          <p className="text-sm text-muted-foreground">
            {count} player{count !== 1 ? 's' : ''} currently online
            {record > 0 && ` • Record: ${record}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="border-amber-500/20 hover:bg-amber-500/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {players.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No players online"
          description="There are currently no players online on the server."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card
              key={player.name}
              className="fantasy-card border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {player.name}
                  </p>
                  <p className={`text-xs ${getVocationColor(player.vocation)}`}>
                    {VOCATION_NAMES_EN[player.vocation] || 'Unknown'} • Lv {player.level}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
