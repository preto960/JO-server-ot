'use client';

import React, { useState, useEffect } from 'react';
import { User, Crown, Coins, Calendar, LogOut, Swords, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Loading from '@/components/ui/loading';
import { PLAYER_GROUP_NAMES, VOCATION_NAMES_EN, type AccountInfo } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface AccountPanelProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export default function AccountPanel({ onLogout, onNavigate }: AccountPanelProps) {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [players, setPlayers] = useState<{ id: number; name: string; level: number; vocation: number; online: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
          setAccount(data.data);
        }
      } catch {
        // not logged in
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <Loading text="Loading account..." />;

  if (!account) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Please log in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">My Account</h2>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Account Info */}
      <Card className="fantasy-card gold-glow border-amber-500/20 bg-[#12121f]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <User className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{account.name}</h3>
              <p className="text-sm text-muted-foreground">{account.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/20 text-amber-500">
                  <Crown className="mr-1 h-3 w-3" />
                  {PLAYER_GROUP_NAMES[account.type] || 'Player'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(account.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Coins className="mx-auto h-5 w-5 text-yellow-400" />
            <p className="mt-1 text-lg font-bold text-yellow-400">{account.coins}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </CardContent>
        </Card>
        <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Swords className="mx-auto h-5 w-5 text-amber-400" />
            <p className="mt-1 text-lg font-bold text-amber-400">{account.playerCount}</p>
            <p className="text-xs text-muted-foreground">Characters</p>
          </CardContent>
        </Card>
        <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto h-5 w-5 text-cyan-400" />
            <p className="mt-1 text-lg font-bold text-cyan-400">{account.premDays}</p>
            <p className="text-xs text-muted-foreground">Premium Days</p>
          </CardContent>
        </Card>
        <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Shield className="mx-auto h-5 w-5 text-green-400" />
            <p className="mt-1 text-lg font-bold text-green-400">Active</p>
            <p className="text-xs text-muted-foreground">Status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
