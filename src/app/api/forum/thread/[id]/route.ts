import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const threadId = parseInt(id);

    if (!threadId) {
      return NextResponse.json(
        { success: false, error: 'Invalid thread ID' },
        { status: 400 }
      );
    }

    // Get the thread (first post)
    const thread = await db.forumThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Increment views
    await db.forumThread.update({
      where: { id: threadId },
      data: { views: { increment: 1 } },
    });

    // In the MyAAC flat schema, the thread itself is the first post.
    // Replies are rows where firstPost = threadId (they reference this thread as their parent).
    const replies = await db.forumThread.findMany({
      where: {
        firstPost: threadId,
        id: { not: threadId }, // Exclude the thread itself
      },
      orderBy: { postDate: 'asc' },
      select: {
        id: true,
        postText: true,
        authorAid: true,
        authorGuid: true,
        postDate: true,
        lastEditAid: true,
        editDate: true,
        postHtml: true,
      },
    });

    // Collect all author IDs for batch lookup
    const allPosts = [thread, ...replies];
    const authorGuids = new Set<number>();
    const authorAids = new Set<number>();

    allPosts.forEach(p => {
      if (p.authorGuid) authorGuids.add(p.authorGuid);
      if (p.authorAid) authorAids.add(p.authorAid);
    });

    const [players, accounts] = await Promise.all([
      authorGuids.size > 0
        ? db.player.findMany({
            where: { id: { in: [...authorGuids] } },
            select: { id: true, name: true, level: true, vocation: true },
          })
        : [],
      authorAids.size > 0
        ? db.account.findMany({
            where: { id: { in: [...authorAids] } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    type PlayerRow = { id: number; name: string; level: number; vocation: number };
    type AccountRow = { id: number; name: string };

    const playerEntries: [number, PlayerRow][] = (players as PlayerRow[]).map(p => [p.id, p]);
    const accountEntries: [number, AccountRow][] = (accounts as AccountRow[]).map(a => [a.id, a]);
    const playerMap = new Map(playerEntries);
    const accountMap = new Map(accountEntries);

    function getAuthorName(authorGuid: number, authorAid: number): string {
      if (authorGuid && playerMap.has(authorGuid)) {
        return playerMap.get(authorGuid)!.name;
      }
      if (authorAid && accountMap.has(authorAid)) {
        return accountMap.get(authorAid)!.name;
      }
      return 'Unknown';
    }

    function getPlayerInfo(authorGuid: number): { name: string; level: number; vocation: number } | null {
      if (authorGuid && playerMap.has(authorGuid)) {
        const p = playerMap.get(authorGuid)!;
        return { name: p.name, level: p.level, vocation: p.vocation };
      }
      return null;
    }

    // Build the first post (thread itself)
    const firstPost = {
      id: thread.id,
      postText: thread.postText,
      authorAid: thread.authorAid,
      authorGuid: thread.authorGuid,
      author: getAuthorName(thread.authorGuid, thread.authorAid),
      player: getPlayerInfo(thread.authorGuid),
      postDate: thread.postDate,
      isEdited: thread.lastEditAid > 0,
      editDate: thread.editDate,
      postHtml: thread.postHtml,
    };

    // Build replies
    const replyPosts = replies.map(reply => ({
      id: reply.id,
      postText: reply.postText,
      authorAid: reply.authorAid,
      authorGuid: reply.authorGuid,
      author: getAuthorName(reply.authorGuid, reply.authorAid),
      player: getPlayerInfo(reply.authorGuid),
      postDate: reply.postDate,
      isEdited: reply.lastEditAid > 0,
      editDate: reply.editDate,
      postHtml: reply.postHtml,
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: thread.id,
        postTopic: thread.postTopic,
        section: thread.section,
        authorAid: thread.authorAid,
        authorGuid: thread.authorGuid,
        author: getAuthorName(thread.authorGuid, thread.authorAid),
        replies: thread.replies,
        views: thread.views + 1, // include the incremented view
        postDate: thread.postDate,
        sticked: thread.sticked,
        closed: thread.closed,
        posts: [firstPost, ...replyPosts],
      },
    });
  } catch (error) {
    console.error('Forum thread detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
