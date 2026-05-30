'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import { formatDistanceToNow } from 'date-fns';
import type { NewsItem } from '@/lib/types';

interface NewsListProps {
  onArticleClick?: (news: NewsItem) => void;
}

export default function NewsList({ onArticleClick }: NewsListProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news?type=1&limit=10')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setNews(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading news..." />;

  if (news.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No news yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item, i) => (
        <Card
          key={item.id}
          className="fantasy-card cursor-pointer border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25 animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
          onClick={() => onArticleClick?.(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-amber-500"
                  >
                    <Newspaper className="mr-1 h-3 w-3" />
                    News
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.date * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {item.body?.replace(/<[^>]*>/g, '').slice(0, 200) || 'No content'}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
