import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AssessmentForm } from "./assessment-form";
import { EvidenceSection } from "./evidence-section";

export default async function ControlDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!member) redirect("/login");

  const control = await prisma.control.findUnique({
    where: { id },
    include: {
      domain: { include: { framework: true } },
      assessments: {
        where: { assessment: { organizationId: member.organizationId } },
        include: { evidence: { orderBy: { createdAt: "desc" } }, updatedBy: { include: { user: true } } },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!control) {
    return <p>Control not found.</p>;
  }

  const current = control.assessments[0];
  const status = current?.status ?? "not_assessed";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">{control.code}</Badge>
          <Badge variant={status as "compliant" | "non_compliant" | "partial" | "not_assessed"}>
            {status.replace("_", " ")}
          </Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold">{control.name}</h1>
        <p className="text-sm text-muted-foreground">
          {control.domain.framework.name} · {control.domain.code} — {control.domain.name}
        </p>
      </div>

      {control.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{control.description}</p>
          </CardContent>
        </Card>
      )}

      {control.guidance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step-by-Step Implementation Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
              {control.guidance.split("\n").map((step, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <AssessmentForm controlId={control.id} memberId={member.id} currentStatus={status} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {current?.evidence && current.evidence.length > 0 && (
            <div className="space-y-2">
              {current.evidence.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {e.type === "file" ? "📎" : e.type === "link" ? "🔗" : "📝"}
                    </span>
                    {e.type === "file" ? (
                      <a href={e.value} target="_blank" className="text-primary underline">{e.filename ?? e.value}</a>
                    ) : e.type === "link" ? (
                      <a href={e.value} target="_blank" rel="noopener noreferrer" className="text-primary underline">{e.value}</a>
                    ) : (
                      <span className="italic text-muted-foreground">&ldquo;{e.value}&rdquo;</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(e.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
          <EvidenceSection assessmentId={current?.assessmentId} controlId={control.id} memberId={member.id} />
        </CardContent>
      </Card>

      {current?.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{current.notes}</p>
            {current.updatedBy.user.name && (
              <p className="mt-2 text-xs text-muted-foreground">
                — {current.updatedBy.user.name}, {formatDate(current.updatedAt)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
