'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { Terminal, Copy, Check } from 'lucide-react';

export default function CommandsPage() {
  const [content, setContent] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content?type=commands')
      .then(r => r.json())
      .then(data => {
        if (data.success) setContent(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Default commands list
  const defaultCommands = [
    { cmd: '/help', desc: 'Muestra la lista de comandos disponibles' },
    { cmd: '/online', desc: 'Muestra la cantidad de jugadores online' },
    { cmd: '/mana', desc: 'Muestra tu mana actual y máxima' },
    { cmd: '/stats', desc: 'Muestra tus estadísticas de personaje' },
    { cmd: '/uptime', desc: 'Muestra el tiempo que el servidor lleva online' },
    { cmd: '/info', desc: 'Muestra información del servidor' },
    { cmd: '/buyhouse', desc: 'Compra la casa que tienes frente a ti' },
    { cmd: '/sellhouse', desc: 'Vende tu casa' },
    { cmd: '/aol', desc: 'Compra un amuleto de life (AOL)' },
    { cmd: '/blessings', desc: 'Compra todas las bendiciones' },
    { cmd: '/addons', desc: 'Compra todos los addons' },
  ];

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) return <Loading text="Cargando comandos..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <Card className="border-amber-500/20 bg-[#12121f]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Terminal className="h-5 w-5 text-amber-500" />
            {content?.title || 'Comandos del Servidor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content?.body && content.body.trim() !== '' ? (
            <div
              className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          ) : null}

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-500/80">
            Comandos del Chat
          </h3>

          <div className="space-y-1">
            {defaultCommands.map((item) => (
              <div
                key={item.cmd}
                className="flex items-center justify-between rounded-md bg-[#1a1a2e] px-3 py-2.5 group"
              >
                <div className="flex items-center gap-3">
                  <code className="rounded bg-[#12121f] px-2 py-0.5 font-mono text-sm text-amber-400 border border-amber-500/10">
                    {item.cmd}
                  </code>
                  <span className="text-sm text-muted-foreground">{item.desc}</span>
                </div>
                <button
                  onClick={() => copyCommand(item.cmd)}
                  className="shrink-0 text-muted-foreground/50 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Copiar comando"
                >
                  {copied === item.cmd ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
