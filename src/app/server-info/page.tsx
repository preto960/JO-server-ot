'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { Server, Map, Wifi, Globe } from 'lucide-react';

export default function ServerInfoPage() {
  const [content, setContent] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [record, setRecord] = useState(0);

  useEffect(() => {
    fetch('/api/content?type=serverinfo')
      .then(r => r.json())
      .then(data => {
        if (data.success) setContent(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/online')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOnlineCount(data.data.count);
          setRecord(data.data.record || 0);
        }
      })
      .catch(() => {});
  }, []);

  if (loading) return <Loading text="Cargando información del servidor..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Server Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Wifi className="mx-auto h-5 w-5 text-green-400" />
            <p className="mt-1 text-xl font-bold text-green-400">Online</p>
            <p className="text-xs text-muted-foreground">Estado</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Globe className="mx-auto h-5 w-5 text-amber-400" />
            <p className="mt-1 text-xl font-bold text-amber-400">{onlineCount}</p>
            <p className="text-xs text-muted-foreground">Jugadores Online</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Server className="mx-auto h-5 w-5 text-yellow-400" />
            <p className="mt-1 text-xl font-bold text-yellow-400">{record || onlineCount}</p>
            <p className="text-xs text-muted-foreground">Récord</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/10 bg-[#12121f]">
          <CardContent className="p-4 text-center">
            <Map className="mx-auto h-5 w-5 text-cyan-400" />
            <p className="mt-1 text-xl font-bold text-cyan-400">7.72</p>
            <p className="text-xs text-muted-foreground">Versión</p>
          </CardContent>
        </Card>
      </div>

      {/* Server Info Content */}
      <Card className="border-amber-500/20 bg-[#12121f]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Server className="h-5 w-5 text-amber-500" />
            {content?.title || 'Información del Servidor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!content || !content.body || content.body.trim() === '' ? (
            <EmptyState
              icon={<Server className="h-12 w-12" />}
              title="Información del servidor"
              description="No hay información detallada disponible."
            />
          ) : (
            <div
              className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          )}
        </CardContent>
      </Card>

      {/* Connection Info */}
      <Card className="border-amber-500/10 bg-[#12121f]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información de Conexión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <InfoRow label="IP" value="play.jo-server-ot.com" />
            <InfoRow label="Puerto" value="7171" />
            <InfoRow label="Cliente" value="13.40" />
            <InfoRow label="Tipo" value="PvP" />
            <InfoRow label="Rates" value="Custom" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[#1a1a2e] px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
