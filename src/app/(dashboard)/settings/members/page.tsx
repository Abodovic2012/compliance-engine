import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MembersClient } from "./client";

export default async function MembersPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: { include: { members: { include: { user: true } }, inviteTokens: { where: { usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } } } } },
  });
  if (!member) redirect("/dashboard");

  return <MembersClient member={member} />;
}
