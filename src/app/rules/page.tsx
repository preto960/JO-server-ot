'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { BookOpen } from 'lucide-react';

export default function RulesPage() {
  const [content, setContent] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/content?type=rules')
      .then(r => r.json())
      .then(data => {
        if (data.success) setContent(data.data);
        else setError(data.error || 'Error al cargar las reglas');
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando reglas..." />;

  if (error || !content) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="Reglas del Servidor"
          description={error || "No hay reglas disponibles en este momento."}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <Card className="border-amber-500/20 bg-[#12121f]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-amber-500" />
            {content.title || 'Reglas del Servidor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
