import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const VALID_TYPES = ['rules', 'faq', 'serverinfo', 'commands', 'team', 'houses'] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return NextResponse.json(
        { success: false, error: 'Tipo de contenido inválido. Tipos válidos: rules, faq, serverinfo, commands, team, houses' },
        { status: 400 }
      );
    }

    const page = await db.page.findUnique({
      where: { name: type },
      select: {
        id: true,
        name: true,
        title: true,
        body: true,
        date: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Contenido no encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
