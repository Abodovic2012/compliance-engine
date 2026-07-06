import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function RefDetailPage({ params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!member) redirect("/login");

  const framework = await prisma.framework.findUnique({ where: { slug } });
  if (!framework) return <p>Framework not found.</p>;

  const ref = await prisma.ref.findUnique({
    where: { code_frameworkId: { code, frameworkId: framework.id } },
    include: {
      dataItems: {
        include: { dataItem: true },
        orderBy: { dataItem: { code: "asc" } },
      },
    },
  });

  if (!ref) return <p>Reference not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/frameworks/${slug}`}
          className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          ← Back to {framework.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="font-mono">{ref.code}</Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold">{ref.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{ref.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related Data Items ({ref.dataItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ref.dataItems.map((rdi) => (
              <div key={rdi.id} className="rounded-md border px-4 py-3">
                <p className="font-mono text-xs text-muted-foreground">{rdi.dataItem.code}</p>
                <p className="font-medium">{rdi.dataItem.name}</p>
                <p className="text-sm text-muted-foreground">{rdi.dataItem.description}</p>
              </div>
            ))}
            {ref.dataItems.length === 0 && (
              <p className="text-sm text-muted-foreground">No data items mapped to this reference.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Item Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ref.dataItems.map((rdi) => (
              <div key={rdi.id} className="rounded-md border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{rdi.dataItem.code}</span>
                  <span className="font-medium">{rdi.dataItem.name}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{rdi.dataItem.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {ref.code}
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {rdi.dataItem.code}
                  </span>
                </div>
              </div>
            ))}
            {ref.dataItems.length === 0 && (
              <p className="text-sm text-muted-foreground">No mappings defined.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
