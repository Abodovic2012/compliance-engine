import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const frameworkId = searchParams.get("frameworkId");

    const whereControl: Record<string, unknown> = {};
    if (frameworkId) whereControl.frameworkId = frameworkId;

    const controls = await prisma.control.findMany({
      where: whereControl,
      include: {
        framework: true,
        mappings: { include: { dataItem: true } },
      },
      orderBy: [{ frameworkId: "asc" }, { ref: "asc" }],
    });

    const gap = controls.map((c) => ({
      framework: c.framework.name,
      controlRef: c.ref,
      controlTheme: c.theme,
      mappedDataItems: c.mappings.length,
      dataItems: c.mappings.map((m) => ({
        key: m.dataItem.key,
        label: m.dataItem.label,
        severity: m.severity,
        justification: m.justification,
        testId: m.testId,
      })),
    }));

    const totalControls = controls.length;
    const mappedControls = controls.filter((c) => c.mappings.length > 0).length;
    const gapControls = totalControls - mappedControls;

    return Response.json({
      generatedAt: new Date().toISOString(),
      frameworkId: frameworkId || "ALL",
      totalControls,
      mappedControls,
      gapControls,
      gapPercentage: totalControls > 0 ? Math.round((gapControls / totalControls) * 100) : 0,
      controls: gap,
    });
  } catch (error) {
    logger.error("Failed to generate gap analysis", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
