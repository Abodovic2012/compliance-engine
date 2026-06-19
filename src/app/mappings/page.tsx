import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MappingsPage() {
  const mappings = await prisma.mapping.findMany({
    include: {
      dataItem: true,
      control: { include: { framework: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });

  const byFramework: Record<string, number> = {};
  for (const m of mappings) {
    const name = m.control.framework.name;
    byFramework[name] = (byFramework[name] || 0) + 1;
  }

  const bySeverity: Record<string, number> = {};
  for (const m of mappings) {
    bySeverity[m.severity] = (bySeverity[m.severity] || 0) + 1;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mappings Overview</h1>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-sm mb-3 text-slate-500">By Framework</h2>
          <div className="space-y-2">
            {Object.entries(byFramework).map(([fw, count]) => (
              <div key={fw} className="flex items-center justify-between text-sm">
                <span>{fw}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-sm mb-3 text-slate-500">By Severity</h2>
          <div className="space-y-2">
            {Object.entries(bySeverity).map(([sev, count]) => (
              <div key={sev} className="flex items-center justify-between text-sm">
                <span className={`severity-${sev.toLowerCase()}`}>{sev}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Data Item</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Framework</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Control</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Severity</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Test ID</th>
            </tr>
          </thead>
          <tbody>
            {mappings.slice(0, 50).map((m) => (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/data-items/${m.dataItem.id}`} className="text-blue-600 hover:underline">{m.dataItem.label}</Link>
                </td>
                <td className="px-4 py-3 text-xs">{m.control.framework.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{m.control.ref}</td>
                <td className="px-4 py-3"><span className={`badge badge-${m.severity.toLowerCase()}`}>{m.severity}</span></td>
                <td className="px-4 py-3"><Link href={`/mappings/${m.id}`} className="font-mono text-xs text-blue-600 hover:underline">{m.testId}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {mappings.length > 50 && <p className="text-center text-sm text-slate-400 py-3">Showing 50 of {mappings.length} mappings</p>}
      </div>
    </div>
  );
}
