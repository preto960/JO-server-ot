'use client';

import React from 'react';
import ForumBoards from '@/components/forum/forum-boards';
import { useRouter } from 'next/navigation';

export default function ForumPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <ForumBoards
        onSelectBoard={(boardId) => router.push(`/forum/board/${boardId}`)}
      />
    </div>
  );
}
