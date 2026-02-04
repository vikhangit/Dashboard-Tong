import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/mock-data';

export async function GET() {
  try {
    return NextResponse.json(mockProjects);
  } catch (error) {
    console.error('[v0] Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
