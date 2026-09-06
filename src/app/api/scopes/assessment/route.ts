import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const VALID_MODES = ["checklist", "inventory"] as const;
const VALID_CHECKLIST_STATES = ["done", "partial", "notdone"] as const;
const VALID_INVENTORY_STATES = ["granted", "notgranted"] as const;

export async function GET() {
  try {
    const assessments = await prisma.scopeAssessment.findMany({
      orderBy: [{ mode: "asc" }, { updatedAt: "desc" }],
    });
    return Response.json({ assessments });
  } catch (error) {
    logger.error("Failed to fetch assessments", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scopeId, mode, state, notes, evidence } = body ?? {};

    if (!scopeId || typeof scopeId !== "string") {
      return Response.json({ error: "scopeId is required" }, { status: 400 });
    }
    if (!VALID_MODES.includes(mode)) {
      return Response.json({ error: "mode must be checklist or inventory" }, { status: 400 });
    }
    if (!state || typeof state !== "string") {
      return Response.json({ error: "state is required" }, { status: 400 });
    }
    if (mode === "checklist" && !(VALID_CHECKLIST_STATES as readonly string[]).includes(state)) {
      return Response.json({ error: "state must be done, partial or notdone" }, { status: 400 });
    }
    if (mode === "inventory" && !(VALID_INVENTORY_STATES as readonly string[]).includes(state)) {
      return Response.json({ error: "state must be granted or notgranted" }, { status: 400 });
    }

    const scope = await prisma.scope.findUnique({ where: { id: scopeId } });
    if (!scope) {
      return Response.json({ error: "scope not found" }, { status: 404 });
    }

    const assessment = await prisma.scopeAssessment.upsert({
      where: {
        scopeId_mode: { scopeId, mode },
      },
      update: {
        state,
        notes: notes ?? null,
        evidence: evidence ?? null,
      },
      create: {
        scopeId,
        mode,
        state,
        notes: notes ?? null,
        evidence: evidence ?? null,
      },
    });

    return Response.json({ assessment });
  } catch (error) {
    logger.error("Failed to save assessment", { error: String(error) });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}