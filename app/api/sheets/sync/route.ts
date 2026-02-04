import { NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';
import { mockDirectives, mockTasks, mockProjects } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const { type, config } = await request.json();

    if (config) {
      sheetsService.setConfig(config);
    }

    switch (type) {
      case 'test':
        const isConnected = await sheetsService.testConnection();
        return NextResponse.json({ success: isConnected, message: 'Kết nối thành công' });

      case 'directives':
        await sheetsService.syncDirectivesToSheet(mockDirectives);
        return NextResponse.json({ success: true, message: 'Đã đồng bộ chỉ đạo' });

      case 'tasks':
        await sheetsService.syncTasksToSheet(mockTasks);
        return NextResponse.json({ success: true, message: 'Đã đồng bộ công việc' });

      case 'projects':
        await sheetsService.syncProjectsToSheet(mockProjects);
        return NextResponse.json({ success: true, message: 'Đã đồng bộ dự án' });

      case 'all':
        await Promise.all([
          sheetsService.syncDirectivesToSheet(mockDirectives),
          sheetsService.syncTasksToSheet(mockTasks),
          sheetsService.syncProjectsToSheet(mockProjects)
        ]);
        return NextResponse.json({ success: true, message: 'Đã đồng bộ tất cả dữ liệu' });

      default:
        return NextResponse.json(
          { error: 'Invalid sync type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[v0] Error syncing to sheets:', error);
    return NextResponse.json(
      { error: 'Failed to sync data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
