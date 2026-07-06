import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mapping = await prisma.mapping.findUnique({
      where: { id },
      include: {
        dataItem: true,
        control: { include: { framework: true } },
      },
    });
    if (!mapping) {
      return Response.json({ error: "Mapping not found" }, { status: 404 });
    }
    return Response.json(mapping);
  } catch (error) {
    logger.error("Failed to fetch mapping", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
