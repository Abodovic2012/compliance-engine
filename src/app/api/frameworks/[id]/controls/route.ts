import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const framework = await prisma.framework.findUnique({ where: { id } });
    if (!framework) {
      return Response.json({ error: "Framework not found" }, { status: 404 });
    }
    const controls = await prisma.control.findMany({
      where: { frameworkId: id },
      include: { _count: { select: { mappings: true } } },
      orderBy: { ref: "asc" },
    });
    return Response.json({ framework, controls });
  } catch (error) {
    logger.error("Failed to fetch framework controls", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
