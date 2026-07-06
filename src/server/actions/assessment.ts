"use server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";

export async function updateControlStatus({
  controlId,
  memberId,
  status,
  notes,
}: {
  controlId: string;
  memberId: string;
  status: string;
  notes: string;
}) {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });
    if (!member) return { error: "Member not found" };

    let assessment = await prisma.assessment.findFirst({
      where: { organizationId: member.organizationId, status: "in_progress" },
    });

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: {
          name: `Assessment ${new Date().toLocaleDateString()}`,
          status: "in_progress",
          organizationId: member.organizationId,
        },
      });
    }

    await prisma.controlAssessment.upsert({
      where: {
        assessmentId_controlId: {
          assessmentId: assessment.id,
          controlId,
        },
      },
      update: {
        status,
        notes: notes || undefined,
        updatedByMemberId: memberId,
      },
      create: {
        assessmentId: assessment.id,
        controlId,
        status,
        notes: notes || undefined,
        updatedByMemberId: memberId,
      },
    });

    await log("info", memberId, member.organizationId, "update_status", "control", controlId, {
      status,
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update assessment" };
  }
}
