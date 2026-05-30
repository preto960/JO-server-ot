'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { Users, Shield, Crown, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamMember {
  name: string;
  type: number;
  vocation?: string;
  online?: boolean;
  lastLogin?: number;
}

const GROUP_LABELS: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  6: { label: 'God', color: 'text-red-400 border-red-500/20 bg-red-500/5', icon: <Crown className="h-4 w-4" /> },
  5: { label: 'Community Manager', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', icon: <Star className="h-4 w-4" /> },
  4: { label: 'Game Master', color: 'text-purple-400 border-purple-500/20 bg-purple-500/5', icon: <Shield className="h-4 w-4" /> },
  3: { label: 'Senior Tutor', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5', icon: <Users className="h-4 w-4" /> },
  2: { label: 'Tutor', color: 'text-green-400 border-green-500/20 bg-green-500/5', icon: <Users className="h-4 w-4" /> },
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/players?type=team')
      .then(r => r.json())
      .then(data => {
        if (data.success) setTeam(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fallback: try to get team from content API
    fetch('/api/content?type=team')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.body) {
          try {
            const parsed = JSON.parse(data.data.body);
            if (Array.isArray(parsed)) setTeam(parsed);
          } catch {
            // Not JSON, ignore
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando equipo..." />;

  // Group by type
  const grouped: Record<number, TeamMember[]> = {};
  team.forEach(member => {
    if (!grouped[member.type]) grouped[member.type] = [];
    grouped[member.type].push(member);
  });

  const sortedGroups = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <Card className="border-amber-500/20 bg-[#12121f]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-amber-500" />
            Equipo del Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedGroups.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="Equipo no disponible"
              description="No se encontró información del equipo del servidor."
            />
          ) : (
            <div className="space-y-4">
              {sortedGroups.map(groupType => {
                const config = GROUP_LABELS[groupType] || {
                  label: `Grupo ${groupType}`,
                  color: 'text-muted-foreground border-muted-foreground/20 bg-muted-foreground/5',
                  icon: <Users className="h-4 w-4" />,
                };
                const members = grouped[groupType];

                return (
                  <div key={groupType}>
                    <div className="mb-2 flex items-center gap-2">
                      {config.icon}
                      <h3 className={`text-sm font-semibold uppercase tracking-wider ${config.color.split(' ')[0]}`}>
                        {config.label}s
                      </h3>
                      <Badge variant="outline" className={`text-xs ${config.color}`}>
                        {members.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {members.map((member, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-md bg-[#1a1a2e] px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            {member.online ? (
                              <div className="h-2 w-2 rounded-full bg-green-400" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                            )}
                            <span className="text-sm font-medium text-foreground">{member.name}</span>
                            {member.vocation && (
                              <span className="text-xs text-muted-foreground">{member.vocation}</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {member.online ? (
                              <span className="text-green-400">Online</span>
                            ) : member.lastLogin ? (
                              formatDistanceToNow(new Date(member.lastLogin * 1000), { addSuffix: true })
                            ) : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
