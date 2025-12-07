import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

import { CONFIG } from '@/lib/config';

const generateSchema = z.object({
  prompt: z.string().min(1).max(CONFIG.MAX_CHARS),
  voiceId: z.string().min(1),
  userId: z.string().min(1, "User ID is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = generateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { prompt, voiceId, userId } = validationResult.data;
    
    // 1. Check Cache (Deduplication)
    // Find if we generated this exact prompt with this voice for this user recently
    const existingGeneration = await prisma.audioGeneration.findFirst({
      where: {
        prompt,
        voiceId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingGeneration) {
      // Cache Hit! Duplicate the record to bring it to the top of history
      // This saves API costs and time
      const record = await prisma.audioGeneration.create({
        data: {
          prompt,
          voiceId,
          userId,
          audioData: existingGeneration.audioData,
        },
      });
      return NextResponse.json(record);
    }

    const validatedPrompt = prompt;
    const validatedVoiceId = voiceId;

    // 2. Call ElevenLabs API
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${CONFIG.API.ELEVENLABS.BASE_URL}/${validatedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: validatedPrompt,
          model_id: CONFIG.API.ELEVENLABS.MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate audio', details: errorData },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // 3. Save to Database
    const record = await prisma.audioGeneration.create({
      data: {
        prompt: validatedPrompt,
        voiceId: validatedVoiceId,
        userId,
        audioData: audioBase64,
      },
    });

    return NextResponse.json(record);

  } catch (error) {
    console.error("Generation Error:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
