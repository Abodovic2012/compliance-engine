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
      <div className="space-y-3">
        {item.mappings.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-medium">{m.control.framework.name}</span>
                <span className="text-slate-400 mx-2">/</span>
                <span className="font-mono text-sm">{m.control.ref}</span>
                <span className="text-slate-500 text-sm ml-2">{m.control.theme}</span>
              </div>
              <span className={`badge badge-${m.severity.toLowerCase()}`}>{m.severity}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{m.justification}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">SLA:</span> {m.slaThreshold}</div>
              <div><span className="text-slate-400">Finding:</span> {m.findingType}</div>
              <div className="col-span-2"><span className="text-slate-400">Remediation:</span> {m.remediation}</div>
              <div className="col-span-2"><span className="text-slate-400">Evidence:</span> {m.evidenceRequired}</div>
            </div>
            <div className="flex gap-2 mt-3 text-xs text-slate-400">
              <span>Region: {m.region}</span>
              {m.supplyChainFlag && <span className="text-orange-500">Supply Chain</span>}
              <span>KEV: {m.kevOverride}</span>
              <span>Test: {m.testId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
