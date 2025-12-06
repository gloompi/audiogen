import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await prisma.audioGeneration.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
