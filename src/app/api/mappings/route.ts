import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const dataItemId = searchParams.get("dataItemId");
    const frameworkId = searchParams.get("frameworkId");
    const severity = searchParams.get("severity");
    const where: Record<string, unknown> = {};
    if (dataItemId) where.dataItemId = dataItemId;
    if (frameworkId) where.control = { frameworkId };
    if (severity) where.severity = severity;
    const mappings = await prisma.mapping.findMany({
      where,
      include: {
        dataItem: true,
        control: { include: { framework: true } },
      },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    });
    return Response.json(mappings);
  } catch (error) {
    logger.error("Failed to fetch mappings", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
