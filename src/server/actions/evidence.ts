"use server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function addEvidence(formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string;
    const controlId = formData.get("controlId") as string;
    const assessmentId = formData.get("assessmentId") as string | null;
    const type = formData.get("type") as string;
    const file = formData.get("file") as File | null;

    const member = await prisma.organizationMember.findUnique({ where: { id: memberId } });
    if (!member) return { error: "Member not found" };

    let targetAssessmentId = assessmentId;
    if (!targetAssessmentId) {
      const assessment = await prisma.assessment.findFirst({
        where: { organizationId: member.organizationId, status: "in_progress" },
      });
      if (!assessment) return { error: "No active assessment. Update a control status first." };
      targetAssessmentId = assessment.id;
    }

    const controlAssessment = await prisma.controlAssessment.findUnique({
      where: { assessmentId_controlId: { assessmentId: targetAssessmentId, controlId } },
    });
    if (!controlAssessment) return { error: "Control not yet assessed. Update status first." };

    let value = "";
    let filename: string | null = null;

    if (type === "file" && file && file.size > 0) {
      const ext = file.name.split(".").pop() ?? "bin";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const dir = join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, safeName), Buffer.from(await file.arrayBuffer()));
      value = `/uploads/${safeName}`;
      filename = file.name;
    } else if (type === "link") {
      value = formData.get("value") as string;
      if (!value?.startsWith("http")) return { error: "Invalid URL" };
    } else {
      value = formData.get("value") as string ?? "";
    }

    await prisma.evidence.create({
      data: { type, value, filename, uploadedByMemberId: memberId, controlAssessmentId: controlAssessment.id },
    });

    await log("info", memberId, member.organizationId, "add_evidence", "evidence", controlAssessment.id, { type, filename });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add evidence" };
  }
}

export async function deleteEvidence(evidenceId: string, memberId: string) {
  try {
    const member = await prisma.organizationMember.findUnique({ where: { id: memberId } });
    if (!member) return { error: "Member not found" };

    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: { controlAssessment: { include: { assessment: true } } },
    });
    if (!evidence || evidence.controlAssessment.assessment.organizationId !== member.organizationId) {
      return { error: "Evidence not found" };
    }

    await prisma.evidence.delete({ where: { id: evidenceId } });
    await log("info", memberId, member.organizationId, "delete_evidence", "evidence", evidenceId);
    return { success: true };
  } catch {
    return { error: "Failed to delete evidence" };
  }
}
