import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const TYPE_LABELS: Record<number, string> = {
  1: 'Añadido',
  2: 'Eliminado',
  3: 'Cambiado',
  4: 'Corregido',
};

const WHERE_LABELS: Record<number, string> = {
  1: 'Servidor',
  2: 'Sitio Web',
};

export async function GET() {
  try {
    const entries = await db.changelog.findMany({
      where: { hidden: false },
      orderBy: { date: 'desc' },
    });

    const data = entries.map(e => ({
      ...e,
      typeLabel: TYPE_LABELS[e.type] || 'Desconocido',
      whereLabel: WHERE_LABELS[e.where] || 'Desconocido',
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Changelog API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
