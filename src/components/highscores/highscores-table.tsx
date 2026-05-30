'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/vocations';
import { SKILL_NAMES, VOCATION_NAMES_EN, type HighscoreEntry } from '@/lib/types';
import { getVocationColor } from '@/lib/vocations';

interface HighscoresTableProps {
  compact?: boolean;
}

const SKILL_OPTIONS = [
  { value: '0', label: 'Experience' },
  { value: '1', label: 'Club Fighting' },
  { value: '2', label: 'Sword Fighting' },
  { value: '3', label: 'Axe Fighting' },
  { value: '4', label: 'Distance Fighting' },
  { value: '5', label: 'Shielding' },
  { value: '6', label: 'Fishing' },
  { value: '7', label: 'Magic Level' },
];

export default function HighscoresTable({ compact = false }: HighscoresTableProps) {
  const [skill, setSkill] = useState('0');
  const [vocation, setVocation] = useState('-1');
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<HighscoreEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = compact ? 10 : 25;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      skill,
      vocation,
      page: page.toString(),
      limit: limit.toString(),
    });
    fetch(`/api/highscores?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setEntries(res.data);
          setTotalPages(res.pagination.totalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [skill, vocation, page, limit]);

  const skillLabel = SKILL_OPTIONS.find((s) => s.value === skill)?.label || 'Experience';
  const isExperience = skill === '0';

  if (loading) return <Loading text="Loading highscores..." />;

  return (
    <Card className="fantasy-card border-amber-500/10 bg-[#12121f]">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            {skillLabel} Rankings
          </CardTitle>
          {!compact && (
            <div className="flex gap-2">
              <Select value={skill} onValueChange={(v) => { setSkill(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-40 border-amber-500/20 bg-[#1a1a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-amber-500/20 bg-[#1a1a2e]">
                  {SKILL_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={vocation} onValueChange={(v) => { setVocation(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-36 border-amber-500/20 bg-[#1a1a2e]">
                  <SelectValue placeholder="All Vocations" />
                </SelectTrigger>
                <SelectContent className="border-amber-500/20 bg-[#1a1a2e]">
                  <SelectItem value="-1">All Vocations</SelectItem>
                  {Object.entries(VOCATION_NAMES_EN).map(([k, v]) =>
                    k !== '0' ? (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-12 w-12" />}
            title="No rankings found"
            description="No players found for this skill and vocation combination."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="w-12 pb-2 pr-4 text-center">#</th>
                    <th className="pb-2">Name</th>
                    <th className="hidden pb-2 sm:table-cell">Vocation</th>
                    <th className="pb-2 text-right">{isExperience ? 'Level' : 'Value'}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.rank}
                      className="border-b border-amber-500/5 transition-colors hover:bg-amber-500/5"
                    >
                      <td className="py-2.5 pr-4 text-center">
                        {entry.rank <= 3 ? (
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              entry.rank === 1
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : entry.rank === 2
                                  ? 'bg-gray-400/20 text-gray-300'
                                  : 'bg-amber-700/20 text-amber-600'
                            }`}
                          >
                            {entry.rank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className="font-medium text-foreground">{entry.name}</span>
                      </td>
                      <td className="hidden py-2.5 sm:table-cell">
                        <span className={getVocationColor(entry.vocation)}>
                          {VOCATION_NAMES_EN[entry.vocation] || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-amber-400">
                        {isExperience && entry.level
                          ? `${entry.level}`
                          : formatNumber(entry.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!compact && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-amber-500/20 hover:bg-amber-500/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-amber-500/20 hover:bg-amber-500/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
