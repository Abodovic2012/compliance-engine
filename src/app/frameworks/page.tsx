import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FrameworksPage() {
  const frameworks = await prisma.framework.findMany({
    include: { _count: { select: { controls: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Frameworks</h1>
      <div className="grid grid-cols-2 gap-4">
        {frameworks.map((fw) => (
          <Link key={fw.id} href={`/frameworks/${fw.id}`} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <h2 className="font-semibold mb-1">{fw.name}</h2>
            <div className="flex gap-3 text-xs text-slate-500 mb-3">
              <span>v{fw.version}</span>
              <span>{fw.region}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-600 font-medium">{fw._count.controls}</span>
              <span className="text-slate-400">controls</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
