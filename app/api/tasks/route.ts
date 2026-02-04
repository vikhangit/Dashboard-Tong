import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';

export async function GET() {
  try {
    return NextResponse.json(mockTasks);
  } catch (error) {
    console.error('[v0] Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, status, dueDate } = body;

    // In production, save to database
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockTasks.push(newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // In production, update in database
    const task = mockTasks.find(t => t.id === id);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
