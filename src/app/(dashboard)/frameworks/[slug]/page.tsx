import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function FrameworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!member) redirect("/login");

  const framework = await prisma.framework.findUnique({
    where: { slug },
    include: {
      domains: {
        orderBy: { sortOrder: "asc" },
        include: {
          controls: {
            orderBy: { sortOrder: "asc" },
            include: {
              assessments: {
                where: { assessment: { organizationId: member.organizationId } },
                take: 1,
              },
            },
          },
        },
      },
      refs: { orderBy: { code: "asc" } },
    },
  });

  if (!framework) return <p>Framework not found.</p>;

  const total = framework.domains.reduce((a, d) => a + d.controls.length, 0);
  const compliant = framework.domains.reduce(
    (a, d) => a + d.controls.filter((c) => c.assessments[0]?.status === "compliant").length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{framework.name}</h1>
          <p className="text-sm text-muted-foreground">
            {total} controls · {compliant} compliant
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {framework.domains.map((domain) => {
          const domainCompliant = domain.controls.filter(
            (c) => c.assessments[0]?.status === "compliant"
          ).length;
          return (
            <Card key={domain.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {domain.code} — {domain.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {domainCompliant}/{domain.controls.length} compliant
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {domain.controls.map((control) => {
                    const status = control.assessments[0]?.status ?? "not_assessed";
                    return (
                      <Link
                        key={control.id}
                        href={`/controls/${control.id}`}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground">{control.code}</span>
                          <span>{control.name}</span>
                        </div>
                        <Badge variant={status as "compliant" | "non_compliant" | "partial" | "not_assessed"}>
                          {status.replace("_", " ")}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {framework.refs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">References</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {framework.refs.map((ref) => (
              <Link key={ref.id} href={`/frameworks/${framework.slug}/refs/${ref.code}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle className="text-base">{ref.code}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ref.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
