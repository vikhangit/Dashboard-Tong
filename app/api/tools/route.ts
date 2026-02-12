import { NextResponse } from "next/server";
import { sheetsService } from "@/lib/sheets-service";

export async function GET() {
  try {
    const tools = await sheetsService.getTools();
    return NextResponse.json({
      success: true,
      message: "Tools fetched successfully",
      statusCode: 200,
      data: {
        rows: tools,
        paginations: {
          total: tools.length,
          limit: 100,
          page: 1,
          total_pages: 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching tools:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch tools",
        statusCode: 500,
        data: null,
      },
      { status: 500 },
    );
  }
}
