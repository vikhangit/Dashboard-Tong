import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, timestamp, source } = body;
    
    const webhookUrl = process.env.N8N_WEBHOOK_DIRECT_URL;

    if (!webhookUrl) {
      console.warn('[N8N] Webhook URL not configured');
      return NextResponse.json({ success: false, error: 'N8N Webhook URL not configured' }, { status: 500 });
    }

    // Fire and forget, or wait? Usually better to wait for at least an ack
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        timestamp: timestamp || new Date().toISOString(),
        source: source || 'voice-assistant',
      }),
    });

    if (!response.ok) {
      console.error('[N8N] Webhook failed', response.status, response.statusText);
      // We might not want to block the user if N8N is down, but let's log it.
      // Returning success: true anyway to the frontend so the user flow isn't interrupted, 
      // unless strict consistency is required.
      // Let's return error for now so we can debug.
      return NextResponse.json({ success: false, error: 'N8N Webhook failed' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[N8N] Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to send to N8N' },
      { status: 500 }
    );
  }
}
