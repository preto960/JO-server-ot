'use client';

import React, { useState } from 'react';
import { Search, Swords } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { VOCATION_NAMES_EN, type PlayerInfo } from '@/lib/types';
import { getVocationColor, formatNumber } from '@/lib/vocations';
import { formatDistanceToNow } from 'date-fns';

interface PlayerSearchProps {
  onSelectPlayer?: (name: string) => void;
  initialSearch?: string;
}

export default function PlayerSearch({ onSelectPlayer, initialSearch }: PlayerSearchProps) {
  const [query, setQuery] = useState(initialSearch || '');
  const [results, setResults] = useState<PlayerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (query.length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/players?name=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for a character..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="border-amber-500/20 bg-[#1a1a2e] pl-10 placeholder:text-muted-foreground/50"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || query.length < 2}
          className="bg-amber-500 text-black hover:bg-amber-400"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {loading && <Loading text="Searching..." />}

      {searched && !loading && results.length === 0 && (
        <EmptyState
          icon={<Swords className="h-12 w-12" />}
          title="No characters found"
          description={`No characters matching "${query}" were found.`}
        />
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((player) => (
            <Card
              key={player.id}
              className="fantasy-card cursor-pointer border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25"
              onClick={() => onSelectPlayer?.(player.name)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                    <Swords className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{player.name}</p>
                    <p className={`text-xs ${getVocationColor(player.vocation)}`}>
                      {VOCATION_NAMES_EN[player.vocation] || 'Unknown'} • Level {player.level}
                    </p>
                  </div>
                </div>
                {player.online && (
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
