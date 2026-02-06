import { NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';

export async function GET() {
  try {
    const incidents = await sheetsService.getIncidents();
    return NextResponse.json(incidents);
  } catch (error) {
    console.error('[API] Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    // First get the existing incident to merge
    const incidents = await sheetsService.getIncidents();
    const existing = incidents.find((i) => i.id === id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    const updatedIncident = { ...existing, ...updates };
    await sheetsService.updateIncident(updatedIncident);

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('[API] Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
