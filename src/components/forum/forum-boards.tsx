'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';
import type { ForumBoardInfo } from '@/lib/types';

interface ForumBoardsProps {
  onSelectBoard?: (boardId: number, boardName: string) => void;
}

export default function ForumBoards({ onSelectBoard }: ForumBoardsProps) {
  const [boards, setBoards] = useState<ForumBoardInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/boards')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBoards(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading forum..." />;

  if (boards.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title="No forum boards"
        description="There are no forum boards available yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground">Forum</h2>
      </div>

      <div className="space-y-3">
        {boards.map((board) => (
          <Card
            key={board.id}
            className="fantasy-card cursor-pointer border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25"
            onClick={() => onSelectBoard?.(board.id, board.name)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{board.name}</h3>
                  {board.description && (
                    <p className="text-sm text-muted-foreground">{board.description}</p>
                  )}
                </div>
              </div>
              <div className="hidden items-center gap-6 sm:flex">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{board.threads}</p>
                  <p className="text-xs text-muted-foreground">threads</p>
                </div>
                {board.lastPost && (
                  <div className="max-w-48 text-right">
                    <p className="truncate text-xs text-foreground">{board.lastPost.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(board.lastPost.date * 1000), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
