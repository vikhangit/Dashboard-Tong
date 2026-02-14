import { NextResponse } from "next/server";
import { sheetsService } from "@/lib/sheets-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const checklist = await sheetsService.getChecklist();
    return NextResponse.json({ data: checklist });
  } catch (error) {
    console.error("[API] Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 },
    );
  }
}
