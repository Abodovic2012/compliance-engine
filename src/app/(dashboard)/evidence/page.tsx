import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function EvidencePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const member = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!member) redirect("/login");

  const evidence = await prisma.evidence.findMany({
    where: { uploadedBy: { organizationId: member.organizationId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      controlAssessment: {
        include: { control: true, assessment: true },
      },
      uploadedBy: { include: { user: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Evidence</h1>
      <div className="space-y-3">
        {evidence.map((e) => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{e.type}</Badge>
                {e.filename ?? e.value.slice(0, 60)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Control: {e.controlAssessment.control.code} — {e.controlAssessment.control.name}</p>
              <p>Uploaded by {e.uploadedBy.user.name ?? "Unknown"} on {e.createdAt.toLocaleDateString()}</p>
              {e.type === "link" && (
                <a href={e.value} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Open link
                </a>
              )}
              {e.type === "note" && <p className="mt-1 italic">&ldquo;{e.value}&rdquo;</p>}
            </CardContent>
          </Card>
        ))}
        {evidence.length === 0 && <p className="text-sm text-muted-foreground">No evidence uploaded yet.</p>}
      </div>
    </div>
  );
}
