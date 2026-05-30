import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const boards = await db.forumBoard.findMany({
      where: { hidden: false },
      orderBy: { ordering: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        ordering: true,
        closed: true,
        hidden: true,
        _count: {
          select: { threads: true },
        },
      },
    });

    const data = boards.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      ordering: b.ordering,
      closed: b.closed,
      hidden: b.hidden,
      threadCount: b._count.threads,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Forum boards error:', error);
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
