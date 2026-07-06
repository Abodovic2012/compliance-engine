import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PoliciesPage() {
  const frameworks = await prisma.framework.findMany({
    include: { _count: { select: { controls: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Policy Generator</h1>
      <p className="text-sm text-slate-500 mb-6">
        Generate compliant policy documents derived directly from each framework&apos;s control requirements. Each policy is 100% aligned with the official framework specification.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {frameworks.map((fw) => (
          <Link
            key={fw.id}
            href={`/policies/${fw.id}`}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-semibold mb-1">{fw.name}</h2>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span>v{fw.version}</span>
                  <span>{fw.region}</span>
                </div>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">
                {fw._count.controls} controls
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              <span>Generate Policy</span>
              <span>&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
