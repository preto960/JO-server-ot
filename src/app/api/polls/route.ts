import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { z } from 'zod';

export async function GET() {
  try {
    const now = Math.floor(Date.now() / 1000);

    const poll = await db.poll.findFirst({
      where: {
        OR: [
          { endDate: 0 },
          { endDate: { gt: now } },
        ],
      },
      orderBy: { startDate: 'desc' },
      include: { pollAnswers: true },
    });

    if (!poll) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: poll });
  } catch (error) {
    console.error('Polls API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

const voteSchema = z.object({
  pollId: z.number().int(),
  answerId: z.number().int(),
});

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'pollId y answerId requeridos.' }, { status: 400 });
    }

    const { pollId, answerId } = parsed.data;

    const pollAnswer = await db.pollAnswer.findUnique({
      where: { pollId_answerId: { pollId, answerId } },
    });

    if (!pollAnswer) {
      return NextResponse.json({ success: false, error: 'Respuesta no encontrada.' }, { status: 404 });
    }

    await db.pollAnswer.update({
      where: { pollId_answerId: { pollId, answerId } },
      data: { votes: { increment: 1 } },
    });

    await db.poll.update({
      where: { id: pollId },
      data: { votesAll: { increment: 1 } },
    });

    return NextResponse.json({ success: true, message: 'Voto registrado.' });
  } catch (error) {
    console.error('Poll vote error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
