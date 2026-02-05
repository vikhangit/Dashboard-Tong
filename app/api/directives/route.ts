import { NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';
import { mockDirectives } from '@/lib/mock-data';

// Helper to check if configured
const isConfigured = () => {
    return !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
};

export async function GET() {
  try {
    if (!isConfigured()) {
        console.warn('Google Sheets not configured, returning mock data');
        return NextResponse.json(mockDirectives);
    }

    const directives = await sheetsService.getDirectives();
    return NextResponse.json(directives);
  } catch (error) {
    console.error('[API] Error fetching directives:', error);
    // Fallback to mock data on error to prevent UI breakage
    return NextResponse.json(mockDirectives);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, assignedTo, status } = body;

    const newDirective = {
      content,
      assignedTo,
      status: status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline: undefined // Or allow passing deadline if UI supports it
    };

    if (isConfigured()) {
        await sheetsService.syncDirectivesToSheet([newDirective]);
    } else {
        mockDirectives.push({
            ...newDirective,
            id: Date.now().toString()
        } as any);
    }

    return NextResponse.json(newDirective, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating directive:', error);
    return NextResponse.json(
      { error: 'Failed to create directive' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return NextResponse.json({ message: "Update not fully supported with Sheets yet" });
}
