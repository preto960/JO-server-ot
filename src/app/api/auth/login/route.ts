import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Email y contraseña requeridos.' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const account = await db.account.findFirst({
      where: {
        OR: [{ email }, { name: email }],
      },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 401 });
    }

    const valid = verifyPassword(password, account.password, account.salt || undefined);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Contraseña incorrecta.' }, { status: 401 });
    }

    const token = createToken({ accountId: account.id, type: account.type });

    const playerCount = await db.player.count({ where: { accountId: account.id } });

    const response = NextResponse.json({
      success: true,
      data: {
        id: account.id,
        name: account.name,
        email: account.email,
        type: account.type,
        premDays: account.premDays,
        coins: account.coins,
        playerCount,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
