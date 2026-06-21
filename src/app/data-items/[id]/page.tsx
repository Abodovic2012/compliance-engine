import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DataItemPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await prisma.dataItem.findFirst({
    where: { OR: [{ id }, { key: id }] },
    include: {
      mappings: {
        include: { control: { include: { framework: true } } },
        orderBy: { severity: "asc" },
      },
    },
  });

  if (!item) {
    return <div className="p-8 text-center text-slate-500">Data item not found</div>;
  }

  return (
    <div>
      <Link href="/data-items" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Data Items</Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h1 className="text-xl font-bold mb-1">{item.label}</h1>
        <p className="font-mono text-xs text-slate-400 mb-3">{item.key}</p>
        {item.description && <p className="text-sm text-slate-600 mb-4">{item.description}</p>}
        <div className="flex gap-3 text-sm">
          <span className="badge bg-slate-100 text-slate-600">{item.category}</span>
          <span className="badge bg-slate-100 text-slate-600">{item.domain}</span>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Framework Mappings ({item.mappings.length})</h2>
      {Object.entries(
        item.mappings.reduce((acc, m) => {
          const fw = m.control.framework.name;
          if (!acc[fw]) acc[fw] = [];
          acc[fw].push(m);
          return acc;
        }, {} as Record<string, typeof item.mappings>)
      ).map(([frameworkName, mappings]) => (
        <div key={frameworkName} className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-slate-700 border-b border-slate-200 pb-2">{frameworkName} <span className="text-sm font-normal text-slate-400">({mappings.length})</span></h3>
          <div className="space-y-3">
            {mappings.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-sm font-medium">{m.control.ref}</span>
                    {m.control.theme && <span className="text-slate-500 text-sm ml-2">({m.control.theme})</span>}
                    <Link href={`/mappings/${m.id}`} className="text-xs text-blue-600 hover:underline ml-2">#{m.testId}</Link>
                  </div>
                  <span className={`badge badge-${m.severity.toLowerCase()}`}>{m.severity}</span>
                </div>
                <p className="text-sm text-slate-500 mb-3 italic">{m.control.description}</p>
                <p className="text-sm text-slate-600 mb-3">{m.justification}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-400">SLA:</span> {m.slaThreshold}</div>
                  <div><span className="text-slate-400">Finding:</span> {m.findingType}</div>
                  <div className="col-span-2"><span className="text-slate-400">Remediation:</span> {m.remediation}</div>
                  <div className="col-span-2"><span className="text-slate-400">Evidence:</span> {m.evidenceRequired}</div>
                </div>
                <div className="flex gap-3 mt-3 text-xs text-slate-400">
                  <span>Region: {m.region}</span>
                  {m.supplyChainFlag ? <span className="text-orange-500 font-medium">Supply Chain</span> : <span>Supply Chain: No</span>}
                  <span>KEV: {m.kevOverride}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
