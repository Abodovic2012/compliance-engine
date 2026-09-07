import { logger } from "@/lib/logger";
import { buildAuditReport } from "@/lib/audit-report";

export async function GET() {
  try {
    const report = await buildAuditReport();
    return Response.json(report);
  } catch (error) {
    logger.error("Failed to build audit report", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}