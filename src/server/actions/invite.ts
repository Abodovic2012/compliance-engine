"use server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { randomBytes } from "crypto";

export async function createInvite({
  email,
  memberId,
}: {
  email: string;
  memberId: string;
}) {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: { organization: true },
    });
    if (!member) return { error: "Member not found" };
    if (member.role !== "admin") return { error: "Only admins can invite" };

    const existing = await prisma.organizationMember.findFirst({
      where: { organizationId: member.organizationId, user: { email } },
    });
    if (existing) return { error: "User already a member" };

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.inviteToken.create({
      data: { email, token, organizationId: member.organizationId, createdByMemberId: memberId, expiresAt },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/invite?token=${token}`;
    console.log(`[DEV] Invite: ${email} → ${inviteUrl}`);

    await log("info", memberId, member.organizationId, "invite_sent", "user", email, { email });

    return { success: true, inviteUrl };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create invite" };
  }
}

export async function acceptInvite({ token, userId }: { token: string; userId: string }) {
  try {
    const invite = await prisma.inviteToken.findUnique({ where: { token } });
    if (!invite) return { error: "Invalid or expired invite" };
    if (invite.usedAt) return { error: "Invite already used" };
    if (invite.expiresAt < new Date()) return { error: "Invite has expired" };
    if (invite.email) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.email !== invite.email) return { error: "This invite is for a different email" };
    }

    await prisma.$transaction([
      prisma.organizationMember.create({
        data: { organizationId: invite.organizationId, userId, role: "member" },
      }),
      prisma.inviteToken.update({ where: { id: invite.id }, data: { usedAt: new Date() } }),
    ]);

    return { success: true, organizationId: invite.organizationId };
  } catch (e) {
    console.error(e);
    return { error: "Failed to accept invite" };
  }
}

export async function getPendingInvites(memberId: string) {
  try {
    const member = await prisma.organizationMember.findUnique({ where: { id: memberId } });
    if (!member) return [];
    return prisma.inviteToken.findMany({
      where: { organizationId: member.organizationId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}
