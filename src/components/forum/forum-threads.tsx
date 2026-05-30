'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Pin, Lock, Eye, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';
import type { ForumThreadInfo } from '@/lib/types';

interface ForumThreadsProps {
  boardId: number;
  boardName: string;
  onBack?: () => void;
}

export default function ForumThreads({ boardId, boardName, onBack }: ForumThreadsProps) {
  const [threads, setThreads] = useState<ForumThreadInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/forum/threads?boardId=${boardId}&page=${page}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setThreads(res.data);
          setTotalPages(res.pagination.totalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [boardId, page]);

  if (loading) return <Loading text="Loading threads..." />;

  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-amber-400">
          ← Back to boards
        </Button>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{boardName}</h2>
          <p className="text-sm text-muted-foreground">{threads.length} threads</p>
        </div>
      </div>

      {threads.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No threads"
          description="No threads have been created in this board yet."
        />
      ) : (
        <>
          <div className="space-y-2">
            {threads.map((thread) => (
              <Card
                key={thread.id}
                className="fantasy-card border-amber-500/10 bg-[#12121f] transition-all hover:border-amber-500/25"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.sticked && (
                        <Pin className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      {thread.closed && (
                        <Lock className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {thread.topic}
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>by {thread.author}</span>
                      <span>
                        {formatDistanceToNow(new Date(thread.lastPostDate * 1000), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-4 sm:flex">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      {thread.replies}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {thread.views}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-amber-500/20"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-amber-500/20"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
