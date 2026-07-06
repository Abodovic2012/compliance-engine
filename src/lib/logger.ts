import { prisma } from "./db";

type LogLevel = "info" | "warn" | "error";

export async function log(
  level: LogLevel,
  memberId: string,
  organizationId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        action: `${level}:${action}`,
        entityType,
        entityId,
        metadata: metadata as any,
        memberId,
        organizationId,
      },
    });
  } catch (e) {
    console.error("Audit log write failed:", e);
  }
}
