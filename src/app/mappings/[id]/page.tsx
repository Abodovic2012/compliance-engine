import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MappingDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const mapping = await prisma.mapping.findUnique({
    where: { id },
    include: {
      dataItem: true,
      control: { include: { framework: true } },
    },
  });

  if (!mapping) {
    return <div className="p-8 text-center text-slate-500">Mapping not found</div>;
  }

  const otherMappings = await prisma.mapping.findMany({
    where: { dataItemId: mapping.dataItemId, id: { not: id } },
    include: {
      control: { include: { framework: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <Link href="/mappings" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Mappings</Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h1 className="text-xl font-bold mb-1">{mapping.dataItem.label}</h1>
        <p className="font-mono text-xs text-slate-400 mb-4">{mapping.dataItem.key}</p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <span className="text-slate-400">Category:</span> {mapping.dataItem.category}
          </div>
          <div>
            <span className="text-slate-400">Framework:</span> {mapping.control.framework.name}
          </div>
          <div>
            <span className="text-slate-400">Control Ref:</span> <Link href={`/controls/${mapping.control.id}`} className="font-mono text-blue-600 hover:underline">{mapping.control.ref}</Link>
          </div>
          <div>
            <span className="text-slate-400">Control Theme:</span> {mapping.control.theme}
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">Mapping Justification:</span>
            <p className="mt-1 text-slate-600">{mapping.justification}</p>
          </div>
          <div>
            <span className="text-slate-400">Severity (Default):</span>{" "}
            <span className={`badge badge-${mapping.severity.toLowerCase()}`}>{mapping.severity}</span>
          </div>
          <div>
            <span className="text-slate-400">SLA / Threshold:</span> {mapping.slaThreshold}
          </div>
          <div>
            <span className="text-slate-400">Finding Type:</span> {mapping.findingType}
          </div>
          <div>
            <span className="text-slate-400">Region / Legal Weight:</span> {mapping.region}
          </div>
          <div>
            <span className="text-slate-400">Supply Chain Flag:</span>{" "}
            {mapping.supplyChainFlag ? <span className="text-orange-500 font-medium">Yes</span> : "No"}
          </div>
          <div>
            <span className="text-slate-400">KEV Override:</span> {mapping.kevOverride}
          </div>
          <div>
            <span className="text-slate-400">Test ID:</span> <span className="font-mono">{mapping.testId}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Recommended Remediation:</span>
            <p className="mt-1 text-slate-600">{mapping.remediation}</p>
          </div>
          <div>
            <span className="text-slate-400">Evidence Required:</span>
            <p className="mt-1 text-slate-600">{mapping.evidenceRequired}</p>
          </div>
        </div>
      </div>

      {otherMappings.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Same Data Item — Other Framework Mappings ({otherMappings.length})</h2>
          <div className="space-y-3">
            {otherMappings.map((m) => (
              <Link key={m.id} href={`/mappings/${m.id}`} className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{m.control.framework.name}</span>
                    <span className="text-slate-400 mx-2">/</span>
                    <Link href={`/controls/${m.control.id}`} className="font-mono text-sm text-blue-600 hover:underline">{m.control.ref}</Link>
                    <span className="text-slate-500 text-sm ml-2">{m.control.theme}</span>
                  </div>
                  <span className={`badge badge-${m.severity.toLowerCase()}`}>{m.severity}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">SLA: {m.slaThreshold} | Finding: {m.findingType} | Test: {m.testId}</p>
                <p className="text-sm text-slate-600 line-clamp-2">{m.justification}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
