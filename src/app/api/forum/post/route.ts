import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

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
      select: {
        id: true,
        name: true,
        players: { select: { id: true }, take: 1, orderBy: { level: 'desc' } },
      },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    const body = await request.json();
    const { threadId, content } = body;

    if (!threadId || !content) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: threadId, content' },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: 'El contenido no puede estar vacío.' },
        { status: 400 }
      );
    }

    // Get the parent thread
    const parentThread = await db.forumThread.findUnique({
      where: { id: threadId },
    });

    if (!parentThread) {
      return NextResponse.json({ success: false, error: 'Hilo no encontrado.' }, { status: 404 });
    }

    if (parentThread.closed) {
      return NextResponse.json({ success: false, error: 'Este hilo está cerrado.' }, { status: 403 });
    }

    // Check if the board is closed
    const board = await db.forumBoard.findUnique({
      where: { id: parentThread.section },
    });

    if (board?.closed) {
      return NextResponse.json({ success: false, error: 'Esta sección está cerrada.' }, { status: 403 });
    }

    const playerGuid = account.players[0]?.id || 0;
    const now = Math.floor(Date.now() / 1000);

    // Create the reply as a new row in the same table
    // The firstPost field points to the parent thread (root post)
    const reply = await db.forumThread.create({
      data: {
        section: parentThread.section,
        firstPost: threadId, // References the parent thread
        postText: content,
        authorAid: account.id,
        authorGuid: playerGuid,
        postDate: now,
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

    // Update parent thread: increment replies and update lastPost
    await db.forumThread.update({
      where: { id: threadId },
      data: {
        replies: { increment: 1 },
        lastPost: reply.id,
      },
    });

    const author = playerGuid
      ? (await db.player.findUnique({ where: { id: playerGuid }, select: { name: true } }))?.name || account.name
      : account.name;

    return NextResponse.json({
      success: true,
      data: {
        id: reply.id,
        postText: reply.postText,
        authorAid: account.id,
        authorGuid: playerGuid,
        author,
        postDate: now,
        isEdited: false,
        editDate: 0,
        postHtml: false,
      },
    });
  } catch (error) {
    console.error('Forum reply error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
