import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!member) return null;

  const totalControls = await prisma.control.count();
  const assessed = await prisma.controlAssessment.count({
    where: {
      assessment: { organizationId: member.organizationId },
      status: { not: "not_assessed" },
    },
  });
  const compliant = await prisma.controlAssessment.count({
    where: {
      assessment: { organizationId: member.organizationId },
      status: "compliant",
    },
  });
  const recentLogs = await prisma.auditLog.findMany({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { member: { include: { user: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{member.organization.name}</h1>
        <p className="text-sm text-muted-foreground">Compliance Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalControls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assessed}</p>
            <p className="text-xs text-muted-foreground">
              {totalControls > 0 ? Math.round((assessed / totalControls) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{compliant}</p>
            <p className="text-xs text-muted-foreground">
              {assessed > 0 ? Math.round((compliant / assessed) * 100) : 0}% of assessed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/frameworks/iso27001"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
            >
              <div>
                <p className="font-medium">ISO 27001:2022</p>
                <p className="text-sm text-muted-foreground">93 controls · 4 domains</p>
              </div>
              <Badge variant="outline">View</Badge>
            </Link>
            <Link
              href="/frameworks/soc2"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
            >
              <div>
                <p className="font-medium">SOC 2</p>
                <p className="text-sm text-muted-foreground">99+ controls · 5 criteria</p>
              </div>
              <Badge variant="outline">View</Badge>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLogs.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet. Start assessing controls.</p>
            )}
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{log.member.user.name ?? "Unknown"}</span>{" "}
                  {log.action.replace(/^(info|warn|error):/, "")} {log.entityType.toLowerCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {log.createdAt.toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
