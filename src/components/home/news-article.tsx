'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import { formatDistanceToNow } from 'date-fns';
import type { NewsItem } from '@/lib/types';

interface NewsArticleProps {
  news?: NewsItem;
  onBack?: () => void;
}

export default function NewsArticle({ news: propNews, onBack }: NewsArticleProps) {
  const [news, setNews] = useState<NewsItem | null>(propNews || null);
  const [loading, setLoading] = useState(!propNews);

  useEffect(() => {
    if (propNews) return;
    fetch('/api/news?type=3&limit=1')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data.length > 0) setNews(res.data[0]);
      })
      .finally(() => setLoading(false));
  }, [propNews]);

  if (loading) return <Loading text="Loading article..." />;

  if (!news) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No featured article.
      </div>
    );
  }

  return (
    <Card className="fantasy-card gold-glow border-amber-500/20 bg-[#12121f] overflow-hidden">
      {news.articleImage && (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-amber-900/30 to-red-900/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-amber-500/30" />
          </div>
        </div>
      )}
      <CardContent className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <Badge className="bg-amber-500 text-black">
            <BookOpen className="mr-1 h-3 w-3" />
            Featured Article
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(news.date * 1000), { addSuffix: true })}
          </span>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-foreground">
          {news.title}
        </h2>
        {news.articleText && (
          <p className="mb-4 text-amber-400/80 text-sm italic">
            {news.articleText}
          </p>
        )}
        <div
          className="prose prose-sm prose-invert max-w-none text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: news.body }}
        />
      </CardContent>
    </Card>
  );
}
