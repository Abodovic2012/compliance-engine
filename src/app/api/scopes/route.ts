import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { computeScopeCoverage } from "@/lib/coverage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const where: Record<string, unknown> = {};
    if (provider) where.provider = provider;
    if (category) where.category = category;
    if (q) where.scopeId = { contains: q };

    const scopes = await prisma.scope.findMany({
      where,
      include: {
        _count: { select: { mappings: true } },
        mappings: {
          include: {
            control: {
              select: {
                id: true,
                ref: true,
                theme: true,
                frameworkId: true,
                framework: { select: { name: true, version: true, region: true } },
              },
            },
          },
        },
      },
      orderBy: [{ provider: "asc" }, { category: "asc" }, { scopeId: "asc" }],
    });

    const categories = await prisma.scope.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    const controlCounts = await prisma.control.groupBy({
      by: ["frameworkId"],
      _count: { frameworkId: true },
    });
    const totalControlsByFramework = new Map(
      controlCounts.map((c) => [c.frameworkId, c._count.frameworkId]),
    );

    const scopesWithCoverage = scopes.map((s) => ({
      ...s,
      coverage: computeScopeCoverage(
        s.mappings.map((m) => ({ control: m.control })),
        totalControlsByFramework,
      ),
    }));

    return Response.json({ scopes: scopesWithCoverage, categories });
  } catch (error) {
    logger.error("Failed to fetch scopes", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
