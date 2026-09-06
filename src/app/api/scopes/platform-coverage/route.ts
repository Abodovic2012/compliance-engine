import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { buildPlatformCoverage } from "@/lib/platform-coverage";

export async function GET() {
  try {
    const controls = await prisma.control.findMany({
      select: {
        id: true,
        ref: true,
        frameworkId: true,
        framework: { select: { name: true, version: true, region: true } },
        scopeMappings: {
          select: {
            id: true,
            riskLevel: true,
            scope: {
              select: {
                id: true,
                provider: true,
                scopeId: true,
                displayName: true,
                category: true,
                accessLevel: true,
              },
            },
          },
        },
      },
    });

    const report = buildPlatformCoverage(controls);
    return Response.json(report);
  } catch (error) {
    logger.error("Failed to build platform coverage report", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}