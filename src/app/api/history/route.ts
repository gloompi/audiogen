import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = request.headers.get('X-User-Id');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const history = await prisma.audioGeneration.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 items to prevent payload issues
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get('X-User-Id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    await prisma.audioGeneration.deleteMany({
      where: { userId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear History Error:", error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
