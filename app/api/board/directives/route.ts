import { NextResponse } from 'next/server';
import { mockDirectInputs } from '@/lib/board-mock-data';

export async function GET() {
  return NextResponse.json(mockDirectInputs.filter(d => d.type === 'directive'));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, createdBy } = body;

    console.log('[v0] Processing board directive:', { content, createdBy });

    // In production:
    // 1. Analyze content with AI
    // 2. Categorize and assign priority
    // 3. Save to database
    // 4. Sync to Google Sheets and CMS
    // 5. Send notifications

    // Simulate AI analysis
    // const analysis = await analyzeDirective(content);
    // await saveDirective({ content, createdBy, ...analysis });
    // await syncToSheets('directives', newDirective);
    // await syncToCMS('directives', newDirective);

    return NextResponse.json({ 
      success: true, 
      message: 'Chỉ đạo đã được ghi nhận và phân tích',
      analysis: {
        category: 'operational',
        priority: 'high',
        assignedTo: ['Phòng Tài chính', 'Phòng Kế toán']
      }
    });
  } catch (error) {
    console.error('[v0] Error processing directive:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
