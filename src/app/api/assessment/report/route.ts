import { NextRequest } from "next/server";
import { buildAssessmentReport, fetchAssessmentScopes } from "@/lib/assessment";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") === "inventory" ? "inventory" : "checklist";
    const report = await buildAssessmentReport(mode);
    const scopes = await fetchAssessmentScopes(mode);
    return Response.json({ ...report, scopes });
  } catch (error) {
    logger.error("Failed to build assessment report", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}