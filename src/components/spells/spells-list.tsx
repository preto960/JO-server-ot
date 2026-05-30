'use client';

import React, { useState, useEffect } from 'react';
import { Scroll, Sparkles, Heart, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { VOCATION_NAMES_EN, SPELL_CATEGORY_NAMES, type SpellInfo } from '@/lib/types';

const CATEGORY_ICONS: Record<number, React.ReactNode> = {
  1: <Sparkles className="h-4 w-4 text-red-400" />,
  2: <Heart className="h-4 w-4 text-green-400" />,
  3: <Shield className="h-4 w-4 text-cyan-400" />,
  4: <Scroll className="h-4 w-4 text-amber-400" />,
  5: <Zap className="h-4 w-4 text-purple-400" />,
};

export default function SpellsList() {
  const [spells, setSpells] = useState<SpellInfo[]>([]);
  const [vocation, setVocation] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (vocation !== '0') params.set('vocation', vocation);
    fetch(`/api/spells?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSpells(res.data);
      })
      .finally(() => setLoading(false));
  }, [vocation]);

  if (loading) return <Loading text="Loading spells..." />;

  // Group by category
  const grouped: Record<number, SpellInfo[]> = {};
  spells.forEach((spell) => {
    if (!grouped[spell.category]) grouped[spell.category] = [];
    grouped[spell.category].push(spell);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Scroll className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Spells</h2>
        </div>
        <Select value={vocation} onValueChange={setVocation}>
          <SelectTrigger className="h-8 w-44 border-amber-500/20 bg-[#1a1a2e]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-amber-500/20 bg-[#1a1a2e]">
            <SelectItem value="0">All Vocations</SelectItem>
            {Object.entries(VOCATION_NAMES_EN).map(([k, v]) =>
              k !== '0' ? (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={<Scroll className="h-12 w-12" />}
          title="No spells found"
          description="No spells match your filter."
        />
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([catId, catSpells]) => (
            <Card key={catId} className="fantasy-card border-amber-500/10 bg-[#12121f]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {CATEGORY_ICONS[parseInt(catId)] || <Scroll className="h-4 w-4" />}
                  {SPELL_CATEGORY_NAMES[parseInt(catId)] || `Category ${catId}`}
                  <Badge variant="outline" className="ml-auto border-amber-500/20 text-muted-foreground">
                    {catSpells.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-500/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 pr-4">Spell Name</th>
                        <th className="hidden pb-2 md:table-cell">Words</th>
                        <th className="pb-2">Level</th>
                        <th className="hidden pb-2 sm:table-cell">Mana</th>
                        {parseInt(vocation) === 0 && (
                          <th className="hidden pb-2 lg:table-cell">Vocations</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {catSpells.map((spell) => (
                        <tr key={spell.id} className="border-b border-amber-500/5 hover:bg-amber-500/5">
                          <td className="py-2 pr-4 font-medium text-foreground">{spell.name}</td>
                          <td className="hidden py-2 md:table-cell">
                            <code className="rounded bg-[#1a1a2e] px-1.5 py-0.5 text-xs text-amber-400">
                              {spell.words}
                            </code>
                          </td>
                          <td className="py-2">{spell.level}</td>
                          <td className="hidden py-2 sm:table-cell">{spell.mana}</td>
                          {parseInt(vocation) === 0 && (
                            <td className="hidden py-2 text-xs text-muted-foreground lg:table-cell">
                              {spell.vocations
                                ? spell.vocations
                                    .split(',')
                                    .map((v) => VOCATION_NAMES_EN[parseInt(v.trim())] || '')
                                    .filter(Boolean)
                                    .join(', ')
                                : 'All'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}
