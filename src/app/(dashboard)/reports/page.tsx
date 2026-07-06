import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!member) redirect("/login");

  const assessment = await prisma.assessment.findFirst({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      controlResults: {
        include: { control: { include: { domain: true } }, evidence: true },
      },
    },
  });

  if (!assessment) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          No assessments found. Start assessing controls from the framework pages.
        </p>
      </div>
    );
  }

  const total = assessment.controlResults.length;
  const statusCounts = {
    compliant: assessment.controlResults.filter((r) => r.status === "compliant").length,
    partial: assessment.controlResults.filter((r) => r.status === "partial").length,
    non_compliant: assessment.controlResults.filter((r) => r.status === "non_compliant").length,
    not_assessed: assessment.controlResults.filter((r) => r.status === "not_assessed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Report</h1>
          <p className="text-sm text-muted-foreground">{member.organization.name} · {assessment.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{assessment.status.replace("_", " ")}</Badge>
          <a href={`/api/reports/${assessment.id}`} download>
            <Button size="sm" variant="outline">Download HTML</Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Compliant</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{statusCounts.compliant}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Partial</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-600">{statusCounts.partial}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Non-Compliant</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-600">{statusCounts.non_compliant}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Not Assessed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-gray-500">{statusCounts.not_assessed}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Control Details</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium">Control</th>
                <th className="pb-2 font-medium">Domain</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {assessment.controlResults.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{r.control.code}</td>
                  <td className="py-2">{r.control.name}</td>
                  <td className="py-2 text-muted-foreground">{r.control.domain.code}</td>
                  <td className="py-2">
                    <Badge variant={r.status as "compliant" | "non_compliant" | "partial" | "not_assessed"}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-2 text-muted-foreground">{r.evidence.length} items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
