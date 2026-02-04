import { NextResponse } from 'next/server';
import { mockDecisions } from '@/lib/board-mock-data';

export async function GET() {
  return NextResponse.json(mockDecisions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[v0] Creating new decision:', body);

    // In production, save to database and sync to Google Sheets
    // await createDecision(body);
    // await syncToSheets('decisions', newDecision);

    return NextResponse.json({ 
      success: true, 
      message: 'Quyết định đã được tạo' 
    });
  } catch (error) {
    console.error('[v0] Error creating decision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
