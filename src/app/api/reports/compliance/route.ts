import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const frameworkId = searchParams.get("frameworkId");
    const domain = searchParams.get("domain");

    const whereDataItem: Record<string, unknown> = {};
    if (domain) whereDataItem.domain = domain;

    const whereMapping: Record<string, unknown> = {};
    if (frameworkId) whereMapping.control = { frameworkId };

    const items = await prisma.dataItem.findMany({
      where: whereDataItem,
      include: {
        mappings: {
          where: whereMapping,
          include: { control: { include: { framework: true } } },
        },
      },
      orderBy: { domain: "asc" },
    });

    const report = {
      generatedAt: new Date().toISOString(),
      frameworkId: frameworkId || "ALL",
      domain: domain || "ALL",
      totalDataItems: items.length,
      totalMappings: items.reduce((sum, i) => sum + i.mappings.length, 0),
      bySeverity: {
        critical: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "Critical").length, 0),
        high: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "High").length, 0),
        medium: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "Medium").length, 0),
        low: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "Low").length, 0),
      },
      byDomain: groupBy(items.map((i) => ({ domain: i.domain, count: i.mappings.length })), "domain"),
      items: items.map((i) => ({
        key: i.key,
        label: i.label,
        domain: i.domain,
        mappingsCount: i.mappings.length,
        mappings: i.mappings.map((m) => ({
          framework: m.control.framework.name,
          controlRef: m.control.ref,
          severity: m.severity,
          findingType: m.findingType,
        })),
      })),
    };
    return Response.json(report);
  } catch (error) {
    logger.error("Failed to generate compliance report", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function groupBy<T extends Record<string, unknown>>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce(
    (acc, item) => {
      const k = String(item[key]);
      acc[k] = (acc[k] || 0) + Number(item["count"] ?? 1);
      return acc;
    },
    {} as Record<string, number>,
  );
}
