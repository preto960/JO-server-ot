'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqPage() {
  const [content, setContent] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Try to parse FAQ content into Q&A items
  useEffect(() => {
    fetch('/api/content?type=faq')
      .then(r => r.json())
      .then(data => {
        if (data.success) setContent(data.data);
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
  }, []);

  const parseFaqItems = (body: string): FaqItem[] => {
    // Try to parse HTML content for FAQ items
    const items: FaqItem[] = [];
    const regex = /<(?:h[2-4]|p|strong|b)[^>]*>(.*?)<\/(?:h[2-4]|p|strong|b)>/gi;
    let matches;
    let currentQuestion = '';

    while ((matches = regex.exec(body)) !== null) {
      const text = matches[1].replace(/<[^>]*>/g, '').trim();
      if (text && text.length > 3) {
        if (text.endsWith('?')) {
          if (currentQuestion) {
            items.push({ question: currentQuestion, answer: '' });
          }
          currentQuestion = text;
        } else if (currentQuestion) {
          items.push({ question: currentQuestion, answer: text });
          currentQuestion = '';
        }
      }
    }
    if (currentQuestion) {
      items.push({ question: currentQuestion, answer: '' });
    }

    // If parsing failed, create a single item with all content
    if (items.length === 0 && body.trim()) {
      items.push({
        question: 'Preguntas Frecuentes',
        answer: body.replace(/<[^>]*>/g, '').trim(),
      });
    }

    return items;
  };

  if (loading) return <Loading text="Cargando FAQ..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <Card className="border-amber-500/20 bg-[#12121f]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-amber-500" />
            {content?.title || 'Preguntas Frecuentes (FAQ)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!content || !content.body || content.body.trim() === '' ? (
            <EmptyState
              icon={<HelpCircle className="h-12 w-12" />}
              title="FAQ no disponible"
              description="No hay preguntas frecuentes disponibles en este momento."
            />
          ) : (
            <div className="space-y-2">
              {parseFaqItems(content.body).map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-amber-500/10 bg-[#1a1a2e] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-foreground hover:bg-amber-500/5 transition-colors"
                  >
                    {item.question}
                    {expandedIndex === index ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-amber-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {expandedIndex === index && item.answer && (
                    <div className="border-t border-amber-500/10 px-4 py-3 text-sm text-muted-foreground">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
