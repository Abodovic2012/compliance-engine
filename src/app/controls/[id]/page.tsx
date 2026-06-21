import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ControlDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const control = await prisma.control.findUnique({
    where: { id },
    include: {
      framework: true,
      mappings: {
        include: { dataItem: true },
        orderBy: { severity: "asc" },
      },
    },
  });

  if (!control) {
    return <div className="p-8 text-center text-slate-500">Control not found</div>;
  }

  const severityCounts: Record<string, number> = {};
  for (const m of control.mappings) {
    severityCounts[m.severity] = (severityCounts[m.severity] || 0) + 1;
  }
  const supplyChainCount = control.mappings.filter((m) => m.supplyChainFlag).length;
  const kevCount = control.mappings.filter((m) => m.kevOverride === "Yes").length;

  const severityOrder = ["Critical", "High", "Medium", "Low"];

  return (
    <div>
      <Link href={`/frameworks/${control.framework.id}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to {control.framework.name}</Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide">{control.framework.name} / {control.framework.region}</span>
            <h1 className="text-2xl font-bold mt-1">
              <span className="font-mono">{control.ref}</span>
              {control.theme && <span className="text-lg font-normal text-slate-500 ml-3">({control.theme})</span>}
            </h1>
          </div>
          <Link href={`/frameworks/${control.framework.id}`} className="text-xs text-blue-600 hover:underline">View Framework</Link>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{control.description}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">{control.mappings.length}</div>
          <div className="text-xs text-slate-400 mt-1">Total Mappings</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{supplyChainCount}</div>
          <div className="text-xs text-slate-400 mt-1">Supply Chain</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{kevCount}</div>
          <div className="text-xs text-slate-400 mt-1">KEV</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="flex justify-center gap-1 text-sm">
            {severityOrder.map((sev) => (
              <span key={sev} className={`badge badge-${sev.toLowerCase()} ${severityCounts[sev] ? "" : "opacity-30"}`}>
                {severityCounts[sev] || 0}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-1">By Severity</div>
        </div>
      </div>

      {/* Mappings */}
      <h2 className="font-semibold mb-3">Data Item Mappings ({control.mappings.length})</h2>
      <div className="space-y-3">
        {control.mappings.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Link href={`/data-items/${m.dataItemId}`} className="font-medium text-blue-600 hover:underline">{m.dataItem.label}</Link>
                <span className="text-xs text-slate-400 ml-2 font-mono">{m.dataItem.key}</span>
                <span className="text-xs text-slate-400 ml-2">{m.dataItem.category}</span>
              </div>
              <div className="flex items-center gap-2">
                {m.supplyChainFlag && <span className="text-xs font-medium text-orange-500">SC</span>}
                <span className={`badge badge-${m.severity.toLowerCase()}`}>{m.severity}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3">{m.justification}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div><span className="text-slate-400">SLA:</span> {m.slaThreshold}</div>
              <div><span className="text-slate-400">Finding:</span> {m.findingType}</div>
              <div className="col-span-2"><span className="text-slate-400">Remediation:</span> {m.remediation}</div>
              <div className="col-span-2"><span className="text-slate-400">Evidence:</span> {m.evidenceRequired}</div>
            </div>
            <div className="flex gap-3 mt-3 text-xs text-slate-400">
              <span>Region: {m.region}</span>
              <span>KEV: {m.kevOverride}</span>
              <span className="font-mono">{m.testId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
