'use client';

import React from 'react';
import HighscoresTable from '@/components/highscores/highscores-table';

export default function HighscoresPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <HighscoresTable />
    </div>
  );
}
