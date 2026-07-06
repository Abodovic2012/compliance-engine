import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.dataItem.findFirst({
      where: { OR: [{ id }, { key: id }] },
      include: {
        mappings: {
          include: {
            control: { include: { framework: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!item) {
      return Response.json({ error: "Data item not found" }, { status: 404 });
    }
    return Response.json(item);
  } catch (error) {
    logger.error("Failed to fetch data item", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.mapping.deleteMany({ where: { dataItemId: id } });
    await prisma.dataItem.delete({ where: { id } });
    logger.audit("Data item deleted", { id });
    return Response.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete data item", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
