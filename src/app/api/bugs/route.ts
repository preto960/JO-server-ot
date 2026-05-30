import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createBugSchema = z.object({
  subject: z.string().min(1).max(255),
  text: z.string().min(1),
  type: z.number().int().min(0).max(2),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status !== null && status !== '') {
      where.status = parseInt(status);
    }

    const bugs = await db.bugTracker.findMany({
      where,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        subject: true,
        type: true,
        status: true,
        account: true,
        date: true,
        reply: true,
      },
    });

    return NextResponse.json({ success: true, data: bugs });
  } catch (error) {
    console.error('Bugs API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

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

    const account = await db.account.findUnique({
      where: { id: payload.accountId },
      select: { id: true, name: true },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createBugSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Campos inválidos: subject, text, type requeridos.' }, { status: 400 });
    }

    const bug = await db.bugTracker.create({
      data: {
        account: account.name,
        subject: parsed.data.subject,
        text: parsed.data.text,
        type: parsed.data.type,
        status: 0,
      },
    });

    return NextResponse.json({ success: true, data: bug });
  } catch (error) {
    console.error('Bug create error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
