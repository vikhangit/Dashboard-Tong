import { NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    const result = await aiService.transcribeAudio(base64Audio);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
