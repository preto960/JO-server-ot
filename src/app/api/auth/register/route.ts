import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPasswordSHA1, createToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(3).max(32),
  email: z.string().email().max(255),
  password: z.string().min(6).max(40),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos inválidos. Nombre: 3-32 chars, email válido, contraseña: 6+ chars.' }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await db.account.findFirst({
      where: { OR: [{ name }, { email }] },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'El nombre o email ya están en uso.' }, { status: 409 });
    }

    const account = await db.account.create({
      data: {
        name,
        email,
        password: hashPasswordSHA1(password),
        type: 1,
        premDays: 0,
        coins: 0,
      },
    });

    const token = createToken({ accountId: account.id, type: account.type });

    const response = NextResponse.json({
      success: true,
      data: { id: account.id, name: account.name, email: account.email },
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
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
