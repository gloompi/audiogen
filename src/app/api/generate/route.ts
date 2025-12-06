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
    const { prompt, voiceId } = generateSchema.parse(body);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: prompt,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API Error:", errorText);
        return NextResponse.json({ error: 'Failed to generate audio', details: errorText }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioData = `data:audio/mpeg;base64,${audioBase64}`;

    const generation = await prisma.audioGeneration.create({
      data: {
        prompt,
        voiceId,
        audioData,
      },
    });

    return NextResponse.json(generation);

  } catch (error) {
    console.error("Generation Error:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
