import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('X-User-Id');
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    // Only delete if it belongs to the user
    const result = await prisma.audioGeneration.deleteMany({
      where: { 
        id,
        userId 
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
