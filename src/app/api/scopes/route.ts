import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

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
              select: { ref: true, theme: true, frameworkId: true, framework: { select: { name: true } } },
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

    return Response.json({ scopes, categories });
  } catch (error) {
    logger.error("Failed to fetch scopes", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
