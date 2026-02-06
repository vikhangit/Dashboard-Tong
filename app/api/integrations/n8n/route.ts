import { NextResponse } from "next/server";
import { sendWebhook } from "@/lib/webhook-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    // Use shared webhook service
    await sendWebhook({
      type: "DIRECTIVE",
      action: "DIRECT",
      title: "",
      content: content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[N8N] Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to send to N8N" },
      { status: 500 },
    );
  }
}
