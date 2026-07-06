import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: true,
      user: true,
    },
  });
  if (!member) redirect("/login");

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: member.organizationId },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {member.organization.name}</p>
          <p><span className="text-muted-foreground">Slug:</span> {member.organization.slug}</p>
          <p><span className="text-muted-foreground">Your Role:</span> {member.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{(m.user.name ?? m.user.email).slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{m.user.name ?? "Unnamed"}</p>
                <p className="text-xs text-muted-foreground">{m.user.email} · {m.role}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {member.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Member invitation will be available in a future update. For now, new users who sign up with the same organization slug will automatically join.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
