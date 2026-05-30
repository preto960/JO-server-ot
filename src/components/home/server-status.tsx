'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Users, Trophy, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import { formatNumber } from '@/lib/vocations';
import type { OnlinePlayer } from '@/lib/types';

export default function ServerStatus() {
  const [online, setOnline] = useState(0);
  const [record, setRecord] = useState(0);
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/online');
      const data = await res.json();
      if (data.success) {
        setOnline(data.data.count);
        setRecord(data.data.record);
        setPlayers(data.data.players.slice(0, 10));
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

  if (loading) return <Loading text="Loading status..." />;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="h-5 w-5 text-green-400" />
            <span className="text-xs font-medium text-muted-foreground">
              Status
            </span>
          </div>
          <p className="mt-1 text-xl font-bold text-green-400">Online</p>
        </CardContent>
      </Card>

      <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-medium text-muted-foreground">
              Players Online
            </span>
          </div>
          <p className="mt-1 text-xl font-bold text-amber-400">
            {formatNumber(online)}
          </p>
        </CardContent>
      </Card>

      <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="text-xs font-medium text-muted-foreground">
              Record
            </span>
          </div>
          <p className="mt-1 text-xl font-bold text-yellow-400">
            {formatNumber(record || online)}
          </p>
        </CardContent>
      </Card>

      <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <span className="text-xs font-medium text-muted-foreground">
              Uptime
            </span>
          </div>
          <p className="mt-1 text-xl font-bold text-cyan-400">99.9%</p>
        </CardContent>
      </Card>
    </div>
  );
}
