import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { fetchAuditControls } from "@/lib/audit-report";

export async function GET() {
  try {
    const controls = await fetchAuditControls();
    const frameworks = await prisma.framework.findMany({
      select: { id: true, name: true, version: true, region: true },
      orderBy: { name: "asc" },
    });
    const areas = await prisma.control.findMany({
      select: { auditArea: true },
      where: { auditArea: { not: null } },
      distinct: ["auditArea"],
    });

    return Response.json({
      controls,
      frameworks,
      areas: areas.map((a) => a.auditArea).sort(),
    });
  } catch (error) {
    logger.error("Failed to fetch audit controls", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

const VALID_STATUS = ["compliant", "partial", "noncompliant", "notstarted"];

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }
    const { controlId, status, evidence, notes, assessedBy } = body as {
      controlId?: string;
      status?: string;
      evidence?: string;
      notes?: string;
      assessedBy?: string;
    };
    if (!controlId || typeof controlId !== "string") {
      return Response.json({ error: "controlId is required" }, { status: 400 });
    }
    if (!status || !VALID_STATUS.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.controlAudit.findUnique({ where: { controlId } });
    if (existing) {
      await prisma.controlAudit.update({
        where: { controlId },
        data: {
          status,
          evidence: evidence ?? existing.evidence,
          notes: notes ?? existing.notes,
          assessedBy: assessedBy ?? existing.assessedBy,
        },
      });
    } else {
      await prisma.controlAudit.create({
        data: {
          controlId,
          status,
          evidence: evidence ?? null,
          notes: notes ?? null,
          assessedBy: assessedBy ?? null,
        },
      });
    }

    logger.info("Audit status updated", { controlId, status });
    return Response.json({ ok: true });
  } catch (error) {
    logger.error("Failed to update audit", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}