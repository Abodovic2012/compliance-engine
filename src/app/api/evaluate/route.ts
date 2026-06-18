import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

type EvalResult = {
  dataItemKey: string;
  dataItemLabel: string;
  framework: string;
  controlRef: string;
  controlTheme: string;
  severity: string;
  slaThreshold: string;
  findingType: string;
  compliant: boolean;
  actualValue: unknown;
  remediation: string;
  evidenceRequired: string;
};

async function evaluateSingle(dataItemId: string, actualValue: unknown): Promise<EvalResult[]> {
  const mappings = await prisma.mapping.findMany({
    where: { dataItemId },
    include: {
      dataItem: true,
      control: { include: { framework: true } },
    },
  });
  return mappings.map((m) => {
    const compliant = !m.slaThreshold || actualValue === null || actualValue === undefined
      ? false
      : evaluateCompliance(m, actualValue);
    return {
      dataItemKey: m.dataItem.key,
      dataItemLabel: m.dataItem.label,
      framework: m.control.framework.name,
      controlRef: m.control.ref,
      controlTheme: m.control.theme,
      severity: m.severity,
      slaThreshold: m.slaThreshold,
      findingType: m.findingType,
      compliant,
      actualValue,
      remediation: m.remediation,
      evidenceRequired: m.evidenceRequired,
    };
  });
}

function evaluateCompliance(mapping: { slaThreshold: string; severity: string; dataItem: { key: string } }, value: unknown): boolean {
  const threshold = mapping.slaThreshold.toLowerCase();
  const strVal = String(value);

  if (threshold.includes("zero") || threshold.includes("none")) {
    return strVal === "0" || strVal === "false" || strVal === "none";
  }
  if (threshold.includes("100%")) {
    return strVal === "100" || strVal === "true" || strVal === "yes";
  }
  if (threshold.includes("<=") || threshold.includes("less than") || threshold.includes("within")) {
    const num = parseInt(strVal, 10);
    if (isNaN(num)) return false;
    const match = threshold.match(/(\d+)/);
    if (match) {
      const limit = parseInt(match[1], 10);
      return num <= limit;
    }
  }
  if (threshold.includes(">=")) {
    const num = parseInt(strVal, 10);
    if (isNaN(num)) return false;
    const match = threshold.match(/(\d+)/);
    if (match) {
      const limit = parseInt(match[1], 10);
      return num >= limit;
    }
  }
  if (threshold.includes("enforce") || threshold.includes("active") || threshold.includes("document")) {
    return strVal === "true" || strVal === "yes" || strVal === "enabled";
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataItemId, dataItemKey, actualValue } = body;
    if (!actualValue) {
      return Response.json({ error: "actualValue is required" }, { status: 400 });
    }
    if (dataItemId) {
      const item = await prisma.dataItem.findUnique({ where: { id: dataItemId } });
      if (!item) return Response.json({ error: "Data item not found" }, { status: 404 });
      const results = await evaluateSingle(dataItemId, actualValue);
      return Response.json({ dataItem: item, results });
    }
    if (dataItemKey) {
      const item = await prisma.dataItem.findUnique({ where: { key: dataItemKey } });
      if (!item) return Response.json({ error: "Data item not found" }, { status: 404 });
      const results = await evaluateSingle(item.id, actualValue);
      return Response.json({ dataItem: item, results });
    }
    return Response.json({ error: "dataItemId or dataItemKey required" }, { status: 400 });
  } catch (error) {
    logger.error("Evaluation failed", { error: String(error) });
    return Response.json({ error: "Evaluation error" }, { status: 500 });
  }
}
