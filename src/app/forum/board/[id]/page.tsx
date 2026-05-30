'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ForumThreads from '@/components/forum/forum-threads';

export default function ForumBoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = parseInt(params.id as string);
  const boardName = `Board ${boardId}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <ForumThreads
        boardId={boardId}
        boardName={boardName}
        onBack={() => router.push('/forum')}
      />
    </div>
  );
}
