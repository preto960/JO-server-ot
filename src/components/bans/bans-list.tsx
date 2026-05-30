'use client';

import React, { useState, useEffect } from 'react';
import { Scale, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { BAN_TYPE_NAMES, BAN_ACTION_NAMES, type BanInfo } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function BansList() {
  const [bans, setBans] = useState<BanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bans?page=${page}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setBans(res.data);
          setTotalPages(res.pagination.totalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Loading text="Loading bans..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="h-6 w-6 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground">Active Bans</h2>
      </div>

      {bans.length === 0 ? (
        <EmptyState
          icon={<Scale className="h-12 w-12" />}
          title="No active bans"
          description="There are no active bans on the server."
        />
      ) : (
        <>
          <div className="space-y-2">
            {bans.map((ban) => (
              <Card key={ban.id} className="fantasy-card border-amber-500/10 bg-[#12121f]">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{ban.value}</span>
                        <Badge variant="outline" className="border-red-500/20 text-red-400 text-xs">
                          {BAN_TYPE_NAMES[ban.type] || `Type ${ban.type}`}
                        </Badge>
                        <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-xs">
                          {BAN_ACTION_NAMES[ban.action] || `Action ${ban.action}`}
                        </Badge>
                      </div>
                      {ban.reason && (
                        <p className="text-sm text-muted-foreground">Reason: {ban.reason}</p>
                      )}
                      {ban.comment && (
                        <p className="text-xs text-muted-foreground/70">Comment: {ban.comment}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(ban.added * 1000), {
                          addSuffix: true,
                        })}
                      </div>
                      <p className="mt-1">by {ban.by}</p>
                      {ban.expires > 0 && (
                        <p className="mt-0.5 text-red-400">
                          Expires: {new Date(ban.expires * 1000).toLocaleDateString()}
                        </p>
                      )}
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
                <ChevronLeft className="h-4 w-4" />
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
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
