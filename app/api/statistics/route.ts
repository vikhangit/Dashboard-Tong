import { NextResponse } from 'next/server';
import { calculateStatistics } from '@/lib/mock-data';

export async function GET() {
  try {
    const statistics = calculateStatistics();
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('[v0] Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
