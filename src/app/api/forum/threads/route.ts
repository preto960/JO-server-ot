import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// Helper: resolve author name from authorGuid or authorAid
async function resolveAuthorName(authorGuid: number, authorAid: number): Promise<string> {
  if (authorGuid) {
    const player = await db.player.findUnique({
      where: { id: authorGuid },
      select: { name: true },
    });
    if (player) return player.name;
  }
  if (authorAid) {
    const account = await db.account.findUnique({
      where: { id: authorAid },
      select: { name: true },
    });
    if (account) return account.name;
  }
  return 'Unknown';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = parseInt(searchParams.get('boardId') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!boardId) {
      return NextResponse.json(
        { success: false, error: 'boardId parameter is required' },
        { status: 400 }
      );
    }

    // Verify board exists
    const board = await db.forumBoard.findUnique({
      where: { id: boardId },
      select: { id: true, closed: true },
    });

    if (!board) {
      return NextResponse.json(
        { success: false, error: 'Board not found' },
        { status: 404 }
      );
    }

    // Count only "root" threads (threads that are the first post of a topic)
    // In MyAAC schema, a thread is a "root" when firstPost equals its own id OR firstPost is 0
    // Actually, in the MyAAC forum, ALL rows are in the same table.
    // Threads (topics) are rows where they are referenced as the first_post by themselves or others.
    // For simplicity, we consider threads that have a post_topic (non-empty) as root threads,
    // or threads where firstPost == id (they are their own first post).
    const where = {
      section: boardId,
      // Root threads: they are the first post of the topic
      firstPost: 0, // In MyAAC, root threads typically have firstPost = 0 or their own id
    };

    // Alternative approach: get all unique first_post values that belong to this board section
    // Actually the simplest: get threads where firstPost = id OR firstPost = 0
    // Let's use a different approach: count threads where section = boardId and they are "first posts"
    // In MyAAC, a "thread" is created as a row with first_post = 0 initially, then when replies come,
    // first_post gets updated to point to the thread's own id.
    // So root threads have firstPost = 0 (never updated) or firstPost = their own id.

    const [rootThreads, total] = await Promise.all([
      db.forumThread.findMany({
        where: {
          section: boardId,
          OR: [
            { firstPost: 0 },
            // We can't do firstPost: { equals: id } in Prisma easily,
            // so we get threads and filter below
          ],
        },
        orderBy: [{ sticked: 'desc' }, { postDate: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          postTopic: true,
          authorAid: true,
          authorGuid: true,
          replies: true,
          views: true,
          postDate: true,
          sticked: true,
          closed: true,
          firstPost: true,
        },
      }),
      db.forumThread.count({
        where: {
          section: boardId,
          OR: [
            { firstPost: 0 },
          ],
        },
      }),
    ]);

    // Filter: only show threads where they are root (firstPost === 0 or firstPost === id)
    const filteredThreads = rootThreads.filter(t => t.firstPost === 0 || t.firstPost === t.id);

    // Resolve author names in batch
    const authorIds = new Set<number>();
    filteredThreads.forEach(t => {
      if (t.authorGuid) authorIds.add(t.authorGuid);
      else if (t.authorAid) authorIds.add(t.authorAid);
    });

    const [players, accounts] = await Promise.all([
      authorIds.size > 0
        ? db.player.findMany({
            where: { id: { in: [...authorIds] } },
            select: { id: true, name: true },
          })
        : [],
      authorIds.size > 0
        ? db.account.findMany({
            where: { id: { in: [...authorIds] } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerEntries: [number, string][] = (players as any[]).map((p: any) => [p.id, String(p.name)]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accountEntries: [number, string][] = (accounts as any[]).map((a: any) => [a.id, String(a.name)]);
    const playerMap = new Map(playerEntries);
    const accountMap = new Map(accountEntries);

    const data = filteredThreads.map(thread => {
      let author = 'Unknown';
      if (thread.authorGuid && playerMap.has(thread.authorGuid)) {
        author = playerMap.get(thread.authorGuid)!;
      } else if (thread.authorAid && accountMap.has(thread.authorAid)) {
        author = accountMap.get(thread.authorAid)!;
      }

      return {
        id: thread.id,
        topic: thread.postTopic,
        section: boardId,
        authorAid: thread.authorAid,
        authorGuid: thread.authorGuid,
        author,
        replies: thread.replies,
        views: thread.views,
        postDate: thread.postDate,
        sticked: thread.sticked,
        closed: thread.closed,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      board: { id: board.id, closed: board.closed },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Forum threads error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido.' }, { status: 401 });
    }

    const account = await db.account.findUnique({
      where: { id: payload.accountId },
      select: { id: true, name: true, players: { select: { id: true }, take: 1, orderBy: { level: 'desc' } } },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    const body = await request.json();
    const { boardId, topic, content } = body;

    if (!boardId || !topic || !content) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: boardId, topic, content' },
        { status: 400 }
      );
    }

    // Check board exists and is not closed
    const board = await db.forumBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return NextResponse.json({ success: false, error: 'Sección no encontrada.' }, { status: 404 });
    }

    if (board.closed) {
      return NextResponse.json({ success: false, error: 'Esta sección está cerrada.' }, { status: 403 });
    }

    const playerGuid = account.players[0]?.id || 0;

    // Create the thread (first post in the flat structure)
    const thread = await db.forumThread.create({
      data: {
        section: boardId,
        postTopic: topic,
        postText: content,
        authorAid: account.id,
        authorGuid: playerGuid,
        postDate: Math.floor(Date.now() / 1000),
        firstPost: 0, // will be updated to self-reference
        lastPost: 0,
        replies: 0,
        views: 0,
        postSmile: true,
        postHtml: false,
        sticked: false,
        closed: false,
        postIp: request.headers.get('x-forwarded-for') || '0.0.0.0',
      },
    });

    // Update the thread to reference itself as the first post
    await db.forumThread.update({
      where: { id: thread.id },
      data: { firstPost: thread.id, lastPost: thread.id },
    });

    const author = playerGuid
      ? (await db.player.findUnique({ where: { id: playerGuid }, select: { name: true } }))?.name || account.name
      : account.name;

    return NextResponse.json({
      success: true,
      data: {
        id: thread.id,
        topic: thread.postTopic,
        section: boardId,
        authorAid: account.id,
        authorGuid: playerGuid,
        author,
        replies: 0,
        views: 0,
        postDate: thread.postDate,
        sticked: false,
        closed: false,
      },
    });
  } catch (error) {
    console.error('Forum create thread error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
