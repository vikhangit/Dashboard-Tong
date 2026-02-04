import { NextResponse } from 'next/server';
import { mockDirectives } from '@/lib/mock-data';

export async function GET() {
  try {
    return NextResponse.json(mockDirectives);
  } catch (error) {
    console.error('[v0] Error fetching directives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directives' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, audioUrl, assignedTo, status } = body;

    // In production, this would save to database
    const newDirective = {
      id: Date.now().toString(),
      content,
      audioUrl,
      assignedTo,
      status: status || 'da_chi_dao' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockDirectives.push(newDirective);

    return NextResponse.json(newDirective, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating directive:', error);
    return NextResponse.json(
      { error: 'Failed to create directive' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // In production, update in database
    const directive = mockDirectives.find(d => d.id === id);
    if (directive) {
      directive.status = status;
      directive.updatedAt = new Date();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error updating directive:', error);
    return NextResponse.json(
      { error: 'Failed to update directive' },
      { status: 500 }
    );
  }
}
