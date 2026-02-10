import { NextResponse } from "next/server";
import { sheetsService } from "@/lib/sheets-service";

// Helper to check if configured
const isConfigured = () => {
  return !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
};

export async function GET() {
  try {
    if (!isConfigured()) {
      console.warn("Google Sheets not configured, returning mock data");
    }

    const directives = await sheetsService.getDirectives();
    return NextResponse.json(directives);
  } catch (error) {
    console.error("[API] Error fetching directives:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, assignedTo, status } = body;

    const newDirective = {
      content,
      assignedTo,
      status: status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline: undefined, // Or allow passing deadline if UI supports it
    };

    if (isConfigured()) {
      await sheetsService.syncDirectivesToSheet([newDirective]);
    }

    return NextResponse.json(newDirective, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating directive:", error);
    return NextResponse.json(
      { error: "Failed to create directive" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing directive ID" },
        { status: 400 },
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        { error: "Google Sheets not configured" },
        { status: 500 },
      );
    }

    // 1. Get current directives to find the one we want
    const directives = await sheetsService.getDirectives();
    const currentDirective = directives.find((d) => d.id === id);

    if (!currentDirective) {
      return NextResponse.json(
        { error: "Directive not found" },
        { status: 404 },
      );
    }

    // 2. Merge updates
    const updatedDirective = {
      ...currentDirective,
      ...updates,
      // If updating status to completed, maybe set completedAt? (Format doesn't support it explicitly yet but we have actionContent etc)
      updatedAt: new Date(),
    };

    // 3. Write back to sheet (update specific row)
    await sheetsService.updateDirective(updatedDirective);

    return NextResponse.json({ success: true, data: updatedDirective });
  } catch (error) {
    console.error("[API] Error updating directive:", error);
    return NextResponse.json(
      { error: "Failed to update directive" },
      { status: 500 },
    );
  }
}
