import { NextResponse } from 'next/server';
import { calculateBoardStatistics } from '@/lib/board-mock-data';

export async function GET() {
  const statistics = calculateBoardStatistics();
  return NextResponse.json(statistics);
}
