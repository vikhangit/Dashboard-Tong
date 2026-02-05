import { NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';
import { mockProposals } from '@/lib/mock-data';

// Helper to check if configured
const isConfigured = () => {
    return !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
};

export async function GET() {
  try {
    if (!isConfigured()) {
        return NextResponse.json({ error: 'Google Sheets not configured' }, { status: 503 });
    }

    const proposals = await sheetsService.getProposals();
    return NextResponse.json(proposals);
  } catch (error) {
    console.error('[API] Error fetching proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, directionContent } = body;

    if (!id) {
         return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (!isConfigured()) {
        return NextResponse.json({ error: 'Google Sheets not configured' }, { status: 503 });
    }

    const proposals = await sheetsService.getProposals();
    const currentProposal = proposals.find(p => p.id === id);
    
    if (!currentProposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const updatedProposal = {
        ...currentProposal,
        status: status || currentProposal.status,
        directionContent: directionContent !== undefined ? directionContent : currentProposal.directionContent,
        updatedAt: new Date()
    };

    await sheetsService.updateProposal(updatedProposal);
    return NextResponse.json(updatedProposal);

  } catch (error: any) {
    console.error('[API] Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal', details: error.message },
      { status: 500 }
    );
  }
}
