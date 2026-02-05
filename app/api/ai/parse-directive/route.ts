import { NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    const result = await aiService.parseDirective(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error parsing directive:', error);
    return NextResponse.json(
      { error: 'Failed to parse directive' },
      { status: 500 }
    );
  }
}
