import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body;

    const webhookUrl = process.env.N8N_WEBHOOK_DASHBOARD_CHAT_AI_URL || "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const response = await axios.post(webhookUrl, {
      message,
      history,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
