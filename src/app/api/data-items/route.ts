import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const domain = searchParams.get("domain");
    const category = searchParams.get("category");
    const where: Record<string, unknown> = {};
    if (domain) where.domain = domain;
    if (category) where.category = category;
    const items = await prisma.dataItem.findMany({
      where,
      include: { _count: { select: { mappings: true } } },
      orderBy: { key: "asc" },
    });
    return Response.json(items);
  } catch (error) {
    logger.error("Failed to fetch data items", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, label, description, category, domain, defaultValue } = body;
    if (!key || !label || !category || !domain) {
      return Response.json({ error: "Missing required fields: key, label, category, domain" }, { status: 400 });
    }
    const item = await prisma.dataItem.create({
      data: { key, label, description, category, domain, defaultValue },
    });
    logger.audit("Data item created", { key, domain });
    return Response.json(item, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return Response.json({ error: "Data item with this key already exists" }, { status: 409 });
    }
    logger.error("Failed to create data item", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
