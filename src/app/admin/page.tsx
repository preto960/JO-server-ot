'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import {
  LayoutDashboard, Users, Swords, Newspaper, Shield, Ban,
  TrendingUp, BarChart3, Eye, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalAccounts: number;
  totalPlayers: number;
  totalGuilds: number;
  onlinePlayers: number;
  activeBans: number;
  totalNews: number;
  totalForumPosts: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [account, setAccount] = useState<{ name: string; type: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check auth and admin status
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json()),
    ]).then(([meData, statsData]) => {
      if (meData.success) {
        setAccount(meData.data);
        if (meData.data.type < 4) {
          setError('No tienes permisos de administrador.');
        }
      } else {
        setError('Debes iniciar sesión para acceder a esta página.');
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    }).catch(() => {
      setError('Error de conexión.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando panel de administración..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <EmptyState
          icon={<LayoutDashboard className="h-12 w-12" />}
          title="Acceso Denegado"
          description={error}
          action={
            <Button
              onClick={() => router.push('/')}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              Volver al Inicio
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-amber-500" />
            Panel de Administración
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bienvenido, <span className="text-amber-400">{account?.name}</span>
          </p>
        </div>
        <Badge variant="outline" className="border-red-500/20 text-red-400">
          <Shield className="mr-1 h-3 w-3" />
          Administrador
        </Badge>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5 text-amber-400" />}
            label="Cuentas"
            value={stats.totalAccounts.toLocaleString()}
          />
          <StatCard
            icon={<Swords className="h-5 w-5 text-green-400" />}
            label="Personajes"
            value={stats.totalPlayers.toLocaleString()}
          />
          <StatCard
            icon={<Eye className="h-5 w-5 text-cyan-400" />}
            label="Online"
            value={stats.onlinePlayers.toLocaleString()}
          />
          <StatCard
            icon={<Ban className="h-5 w-5 text-red-400" />}
            label="Bans Activos"
            value={stats.activeBans.toLocaleString()}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminActionCard
          icon={<Newspaper className="h-6 w-6 text-amber-500" />}
          title="Gestionar Noticias"
          description="Crear, editar y eliminar noticias del servidor."
          stats={stats ? `${stats.totalNews} noticias` : undefined}
        />
        <AdminActionCard
          icon={<Users className="h-6 w-6 text-green-400" />}
          title="Gestionar Jugadores"
          description="Buscar, editar y administrar jugadores."
          stats={stats ? `${stats.totalPlayers} personajes` : undefined}
        />
        <AdminActionCard
          icon={<Ban className="h-6 w-6 text-red-400" />}
          title="Gestionar Bans"
          description="Ver y gestionar bans y suspensiones."
          stats={stats ? `${stats.activeBans} bans activos` : undefined}
        />
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="border-amber-500/10 bg-[#12121f]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ActivityItem text="Servidor iniciado" time="Hace 2 horas" type="info" />
            <ActivityItem text="Nuevo registro de cuenta" time="Hace 5 horas" type="success" />
            <ActivityItem text="Ban aplicado a jugador" time="Hace 8 horas" type="warning" />
            <ActivityItem text="Nueva noticia publicada" time="Hace 1 día" type="info" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-amber-500/10 bg-[#12121f]">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function AdminActionCard({
  icon,
  title,
  description,
  stats,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  stats?: string;
}) {
  return (
    <Card className="border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            {stats && (
              <Badge variant="outline" className="mt-2 border-amber-500/20 text-xs text-muted-foreground">
                {stats}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ text, time, type }: { text: string; time: string; type: 'info' | 'success' | 'warning' }) {
  const colors = {
    info: 'bg-cyan-500/10 text-cyan-400',
    success: 'bg-green-500/10 text-green-400',
    warning: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="flex items-center justify-between rounded-md bg-[#1a1a2e] px-3 py-2">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${colors[type].split(' ')[0]}`} />
        <span className="text-sm text-foreground">{text}</span>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}
