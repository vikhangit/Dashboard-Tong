import { NextResponse } from "next/server";
import { sheetsService } from "@/lib/sheets-service";

export async function GET() {
  try {
    const plans = await sheetsService.getPlans();
    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans" },
      { status: 500 },
    );
  }
}
