import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const generateSchema = z.object({
  prompt: z.string().min(1),
  voiceId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, voiceId, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = generateSchema.safeParse({ prompt, voiceId });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const validatedPrompt = validationResult.data.prompt;
    const validatedVoiceId = validationResult.data.voiceId;

    // 2. Call ElevenLabs API
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${validatedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: validatedPrompt,
          model_id: 'eleven_turbo_v2_5',
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
