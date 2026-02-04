import { NextResponse } from 'next/server';
import { mockApprovals, calculateBoardStatistics } from '@/lib/board-mock-data';

export async function GET() {
  return NextResponse.json(mockApprovals);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { approvalId, action, comment } = body;

    console.log('[v0] Processing approval action:', { approvalId, action, comment });

    // In production, update database and sync to Google Sheets
    // await updateApprovalStatus(approvalId, action);
    // await syncToSheets('approvals', approvalId);

    return NextResponse.json({ 
      success: true, 
      message: action === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối' 
    });
  } catch (error) {
    console.error('[v0] Error processing approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
