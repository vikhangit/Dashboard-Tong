import { NextResponse } from "next/server";
import { sheetsService } from "@/lib/sheets-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const revenues = await sheetsService.getRevenues();

    return NextResponse.json({
      success: true,
      data: revenues,
    });
  } catch (error) {
    console.error("[API] Error fetching revenues:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch revenues" },
      { status: 500 },
    );
  }
}
