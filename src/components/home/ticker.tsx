'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Clock } from 'lucide-react';
import Loading from '@/components/ui/loading';
import { formatDistanceToNow } from 'date-fns';
import type { NewsItem } from '@/lib/types';

export default function Ticker() {
  const [tickers, setTickers] = useState<NewsItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news?type=2&limit=10')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setTickers(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (tickers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % tickers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tickers.length]);

  if (loading || tickers.length === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/10 bg-[#12121f] px-4 py-2.5">
      <Megaphone className="h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">
          {tickers[current]?.title}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(tickers[current].date * 1000), {
          addSuffix: true,
        })}
      </span>
      {tickers.length > 1 && (
        <div className="flex gap-1">
          {tickers.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === current ? 'w-4 bg-amber-500' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
