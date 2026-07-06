import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const frameworks = await prisma.framework.findMany({
      include: { _count: { select: { controls: true } } },
      orderBy: { name: "asc" },
    });
    return Response.json(frameworks);
  } catch (error) {
    logger.error("Failed to fetch frameworks", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
