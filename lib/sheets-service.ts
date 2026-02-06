/**
 * Google Sheets Integration Service
 *
 * Uses 'googleapis' to connect to Google Sheets.
 * Requires: GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY
 */

import { google } from "googleapis";
import { format, parse } from "date-fns";

export interface SheetConfig {
  spreadsheetId: string;
  clientEmail?: string;
  privateKey?: string;
  ranges: {
    directives?: string;
    tasks?: string;
    projects?: string;
    proposals?: string;
    incidents?: string;
    plans?: string;
  };
}

export interface SheetRow {
  [key: string]: string | number | Date;
}

class SheetsService {
  private config: SheetConfig;
  private auth: any;
  private sheets: any;

  constructor() {
    // Initialize with environment variables if available
    this.config = {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "",
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ranges: {
        directives: "'Chỉ đạo'!A2:G",
        proposals: "'Đề xuất'!A2:F",
        incidents: "'Sự cố'!A2:G",
        tasks: "Tasks!A2:E", // Default
        projects: "Projects!A2:E", // Default
      },
    };
  }

  setConfig(config: Partial<SheetConfig>) {
    this.config = { ...this.config, ...config };
    this.auth = null; // Reset auth to force re-initialization
    this.sheets = null;
  }

  private async getSheetsClient() {
    if (this.sheets) return this.sheets;

    if (!this.config.clientEmail || !this.config.privateKey) {
      console.warn("[Sheets] Missing credentials in environment variables");
      // Fallback for development/testing without credentials
      return null;
    }

    try {
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.config.clientEmail,
          private_key: this.config.privateKey,
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      this.sheets = google.sheets({ version: "v4", auth: this.auth });
      return this.sheets;
    } catch (error) {
      console.error("[Sheets] Error initializing Google Sheets client:", error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config.spreadsheetId) {
      console.error("[Sheets] Spreadsheet ID not configured");
      return false;
    }

    try {
      const sheets = await this.getSheetsClient();
      if (!sheets) return false;

      await sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      console.log("[Sheets] Connection successful");
      return true;
    } catch (error) {
      console.error("[Sheets] Connection failed:", error);
      return false;
    }
  }

  async readRange(range: string): Promise<any[][]> {
    if (!this.config.spreadsheetId)
      throw new Error("Spreadsheet ID not configured");

    const sheets = await this.getSheetsClient();
    if (!sheets) {
      console.warn("[Sheets] APIs not configured, returning empty array");
      return [];
    }

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`[Sheets] Error reading range ${range}:`, error);
      throw error;
    }
  }

  async appendToSheet(range: string, values: any[][]): Promise<void> {
    if (!this.config.spreadsheetId)
      throw new Error("Spreadsheet ID not configured");

    const sheets = await this.getSheetsClient();
    if (!sheets) {
      console.warn("[Sheets] APIs not configured, skipping write");
      return;
    }

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
      });
    } catch (error) {
      console.error(`[Sheets] Error appending to ${range}:`, error);
      throw error;
    }
  }

  async updateRow(range: string, values: any[][]): Promise<void> {
    if (!this.config.spreadsheetId)
      throw new Error("Spreadsheet ID not configured");

    const sheets = await this.getSheetsClient();
    if (!sheets) {
      console.warn("[Sheets] APIs not configured, skipping update");
      return;
    }

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } catch (error) {
      console.error(`[Sheets] Error updating ${range}:`, error);
      throw error;
    }
  }

  // --- Helper methods for specific entities ---
  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    // Try parsing specific formats
    try {
      if (dateStr.includes("/")) {
        // Handle dd/MM/yyyy HH:mm:ss
        if (dateStr.includes(":")) {
          return parse(dateStr, "dd/MM/yyyy HH:mm:ss", new Date());
        }
        // Handle dd/MM/yyyy
        return parse(dateStr, "dd/MM/yyyy", new Date());
      }
    } catch (e) {
      console.warn(`[Sheets] Check parseDate error for ${dateStr}:`, e);
    }

    return new Date(dateStr);
  }

  private mapStatusToEn(
    status: string,
  ): "pending" | "in_progress" | "completed" {
    const s = status?.toLowerCase().trim();
    if (s === "đã hoàn thành" || s === "completed") return "completed";
    if (s === "đã tiếp nhận" || s === "in_progress") return "in_progress";
    return "pending"; // Default or 'đã chỉ đạo'
  }

  async getDirectives(): Promise<any[]> {
    const range = this.config.ranges.directives || "'Chỉ đạo'!A2:G";
    const rows = await this.readRange(range);

    // Columns: Trạng thái | Thời gian chỉ đạo | Phân Loại | Nội dung chỉ đạo | Người tiếp nhận | Dự kiến hoàn thành | Nội dung xử lý
    return rows.map((row, index) => ({
      id: `row-${index + 2}`, // Generate a temporary ID based on row index (offset for header)
      status: this.mapStatusToEn(row[0] as string),
      createdAt: this.parseDate(row[1] as string),
      category: row[2],
      content: row[3],
      assignedTo: row[4],
      deadline: row[5] ? this.parseDate(row[5] as string) : undefined,
      actionContent: row[6] || "",
    }));
  }

  async syncDirectivesToSheet(directives: any[]): Promise<void> {
    const range = this.config.ranges.directives || "'Chỉ đạo'!A2:G";

    // Columns: Trạng thái | Thời gian chỉ đạo | Phân Loại | Nội dung chỉ đạo | Người tiếp nhận | Dự kiến hoàn thành | Nội dung xử lý
    const values = directives.map((d) => [
      d.status === "completed"
        ? "Đã hoàn thành"
        : d.status === "in_progress"
          ? "Đã tiếp nhận"
          : "Đã chỉ đạo",
      d.createdAt instanceof Date
        ? format(d.createdAt, "dd/MM/yyyy HH:mm:ss")
        : d.createdAt,
      d.category || "Chung",
      d.content,
      d.assignedTo || "",
      d.deadline instanceof Date
        ? format(d.deadline, "dd/MM/yyyy HH:mm:ss")
        : d.deadline || "",
      d.actionContent || "",
    ]);

    await this.appendToSheet(range, values);
  }

  async syncTasksToSheet(tasks: any[]): Promise<void> {
    const range = this.config.ranges.tasks || "Tasks!A2:G";
    const values = tasks.map((t) => [
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      t.dueDate instanceof Date ? t.dueDate.toISOString() : t.dueDate || "",
    ]);
    await this.appendToSheet(range, values);
  }

  async syncProjectsToSheet(projects: any[]): Promise<void> {
    const range = this.config.ranges.projects || "Projects!A2:H";
    const values = projects.map((p) => [
      p.id,
      p.name,
      p.description,
      p.status,
      p.progress,
      p.startDate instanceof Date ? p.startDate.toISOString() : p.startDate,
      p.endDate instanceof Date ? p.endDate.toISOString() : p.endDate || "",
      p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    ]);
    await this.appendToSheet(range, values);
  }

  // --- Incident Helpers ---
  private mapIncidentStatus(
    status: string,
  ): "open" | "directed" | "in_progress" | "resolved" {
    const s = status?.toLowerCase().trim();
    if (s === "đã giải quyết" || s === "resolved") return "resolved";
    if (s === "đang xử lý" || s === "in_progress") return "in_progress";
    if (s === "đã chỉ đạo" || s === "directed") return "directed";
    return "open"; // "Mới" or default
  }

  private mapSeverity(
    severity: string,
  ): "low" | "medium" | "high" | "critical" {
    const s = severity?.toLowerCase().trim();
    if (s === "nghiêm trọng" || s === "critical") return "critical";
    if (s === "cao" || s === "high") return "high";
    if (s === "trung bình" || s === "medium") return "medium";
    return "low"; // "Thấp" or default
  }

  async getIncidents(): Promise<any[]> {
    const range = this.config.ranges.incidents || "'Sự cố'!A2:G";
    const rows = await this.readRange(range);

    // Columns: Trạng thái | Thời gian tạo | Thời gian cập nhật | Sự cố | Mức độ | Chi tiết | Chỉ đạo
    return rows.map((row, index) => ({
      id: `row-${index + 2}`,
      status: this.mapIncidentStatus(row[0] as string),
      createdAt: this.parseDate(row[1] as string),
      updatedAt: this.parseDate(row[2] as string),
      title: row[3],
      severity: this.mapSeverity(row[4] as string),
      description: row[5],
      directionContent: row[6] || "",
    }));
  }

  async getProposals(): Promise<any[]> {
    const range = this.config.ranges.proposals || "'Đề xuất'!A2:F";
    const rows = await this.readRange(range);

    // Columns: Trạng thái | Thời gian tạo | Thời gian cập nhật | Đề xuất | Chi tiết | Nội dung chỉ đạo
    return rows.map((row, index) => {
      const statusRaw = (row[0] as string)?.trim();
      let status = "draft";
      if (statusRaw === "Đã duyệt") status = "approved";
      else if (statusRaw === "Đã gửi") status = "submitted";
      else if (statusRaw === "Từ chối") status = "rejected";
      else if (statusRaw === "Chỉ đạo" || statusRaw === "Đã chỉ đạo")
        status = "directed";

      return {
        id: `row-${index + 2}`,
        status,
        createdAt: this.parseDate(row[1] as string),
        updatedAt: this.parseDate(row[2] as string),
        title: row[3],
        description: row[4],
        directionContent: row[5] || "",
      };
    });
  }

  async syncProposalsToSheet(proposals: any[]): Promise<void> {
    const range = this.config.ranges.proposals || "'Đề xuất'!A2:F";

    // Columns: Trạng thái | Thời gian tạo | Thời gian cập nhật | Đề xuất | Chi tiết | Nội dung chỉ đạo
    const values = proposals.map((p) => {
      let statusLabel = "Nháp";
      if (p.status === "approved") statusLabel = "Đã duyệt";
      else if (p.status === "submitted") statusLabel = "Đã gửi";
      else if (p.status === "rejected") statusLabel = "Từ chối";
      else if (p.status === "directed") statusLabel = "Chỉ đạo";

      return [
        statusLabel,
        p.createdAt instanceof Date && !isNaN(p.createdAt.getTime())
          ? format(p.createdAt, "dd/MM/yyyy")
          : p.createdAt || "",
        p.updatedAt instanceof Date && !isNaN(p.updatedAt.getTime())
          ? format(p.updatedAt, "dd/MM/yyyy HH:mm:ss")
          : p.updatedAt || "",
        p.title,
        p.description,
        p.directionContent || "",
      ];
    });

    await this.appendToSheet(range, values);
  }

  async updateProposal(proposal: any & { id: string }): Promise<void> {
    // ID format is "row-N"
    const rowIndex = parseInt(proposal.id.replace("row-", ""));
    if (isNaN(rowIndex)) {
      throw new Error(`Invalid proposal ID: ${proposal.id}`);
    }

    // We need to write to the specific row.
    // Columns: A:Status, B:Created, C:Updated, D:Title, E:Desc, F:Direction
    // We will overwrite the whole row to be safe, or specific cells?
    // Overwriting whole row ensures consistency.
    const range = `'Đề xuất'!A${rowIndex}:F${rowIndex}`;

    let statusLabel = "Nháp";
    if (proposal.status === "approved") statusLabel = "Đã duyệt";
    else if (proposal.status === "submitted") statusLabel = "Đã gửi";
    else if (proposal.status === "rejected") statusLabel = "Từ chối";
    else if (proposal.status === "directed") statusLabel = "Chỉ đạo";

    const values = [
      [
        statusLabel,
        proposal.createdAt instanceof Date &&
        !isNaN(proposal.createdAt.getTime())
          ? format(proposal.createdAt, "dd/MM/yyyy")
          : proposal.createdAt || "",
        format(new Date(), "dd/MM/yyyy HH:mm:ss"), // Always update updatedAt
        proposal.title,
        proposal.description,
        proposal.directionContent || "",
      ],
    ];

    await this.updateRow(range, values);
  }
  async updateIncident(incident: any & { id: string }): Promise<void> {
    // ID format is "row-N"
    const rowIndex = parseInt(incident.id.replace("row-", ""));
    if (isNaN(rowIndex)) {
      throw new Error(`Invalid incident ID: ${incident.id}`);
    }

    const range = `'Sự cố'!A${rowIndex}:G${rowIndex}`;

    // Map fields back to Vietnamese
    let statusLabel = "Mới";
    if (incident.status === "resolved") statusLabel = "Đã giải quyết";
    else if (incident.status === "in_progress") statusLabel = "Đang xử lý";
    else if (incident.status === "directed") statusLabel = "Đã chỉ đạo";

    let severityLabel = "Thấp";
    if (incident.severity === "critical") severityLabel = "Nghiêm trọng";
    else if (incident.severity === "high") severityLabel = "Cao";
    else if (incident.severity === "medium") severityLabel = "Trung bình";

    const values = [
      [
        statusLabel,
        incident.createdAt instanceof Date &&
        !isNaN(incident.createdAt.getTime())
          ? format(incident.createdAt, "dd/MM/yyyy HH:mm:ss")
          : incident.createdAt || "",
        format(new Date(), "dd/MM/yyyy HH:mm:ss"), // Always update updatedAt
        incident.title,
        severityLabel,
        incident.description,
        incident.directionContent || "",
      ],
    ];

    await this.updateRow(range, values);
  }
}

// Singleton instance
export const sheetsService = new SheetsService();
