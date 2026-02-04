import { NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import { mockDirectives, mockTasks, mockProjects } from '@/lib/mock-data';

export async function GET() {
  try {
    const insights = await aiService.generateInsights({
      directives: mockDirectives,
      tasks: mockTasks,
      projects: mockProjects
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error('[v0] Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
