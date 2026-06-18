import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  const items = await prisma.dataItem.findMany({
    include: {
      mappings: {
        include: { control: { include: { framework: true } } },
      },
    },
    orderBy: { domain: "asc" },
  });

  const totalMappings = items.reduce((sum, i) => sum + i.mappings.length, 0);
  const bySeverity = {
    critical: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "Critical").length, 0),
    high: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "High").length, 0),
    medium: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "Medium").length, 0),
    low: items.reduce((sum, i) => sum + i.mappings.filter((m) => m.severity === "Low").length, 0),
  };
  const byDomain: Record<string, number> = {};
  for (const i of items) {
    byDomain[i.domain] = (byDomain[i.domain] || 0) + i.mappings.length;
  }

  const controls = await prisma.control.findMany({
    include: {
      framework: true,
      mappings: { include: { dataItem: true } },
    },
    orderBy: [{ frameworkId: "asc" }, { ref: "asc" }],
  });

  const totalControls = controls.length;
  const mappedControls = controls.filter((c) => c.mappings.length > 0).length;
  const gapControls = totalControls - mappedControls;
  const gapPercentage = totalControls > 0 ? Math.round((gapControls / totalControls) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Compliance Summary</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-xs text-slate-500">Data Items</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{totalMappings}</p>
            <p className="text-xs text-slate-500">Total Mappings</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{bySeverity.critical}</p>
            <p className="text-xs text-slate-500">Critical</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{bySeverity.high}</p>
            <p className="text-xs text-slate-500">High</p>
          </div>
        </div>
        <h3 className="font-medium text-sm mb-2">By Domain</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byDomain).map(([domain, count]) => (
            <Link key={domain} href={`/data-items?domain=${encodeURIComponent(domain)}`} className="px-3 py-1 bg-slate-100 rounded-full text-xs hover:bg-slate-200">
              {domain}: {count}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-lg mb-4">Gap Analysis</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{totalControls}</p>
            <p className="text-xs text-slate-500">Total Controls</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{mappedControls}</p>
            <p className="text-xs text-slate-500">Mapped</p>
          </div>
          <div className={gapPercentage > 30 ? "bg-red-50 rounded-lg p-4 text-center" : "bg-orange-50 rounded-lg p-4 text-center"}>
            <p className={`text-2xl font-bold ${gapPercentage > 30 ? "text-red-600" : "text-orange-600"}`}>{gapControls}</p>
            <p className="text-xs text-slate-500">Gap ({gapPercentage}%)</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">Generated: {new Date().toLocaleString()}</p>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-500">Control</th>
                <th className="text-left px-4 py-2 font-medium text-slate-500">Theme</th>
                <th className="text-left px-4 py-2 font-medium text-slate-500">Framework</th>
                <th className="text-center px-4 py-2 font-medium text-slate-500">Mapped Items</th>
              </tr>
            </thead>
            <tbody>
              {controls.map((c, i) => (
                <tr key={i} className={`border-b border-slate-100 ${c.mappings.length === 0 ? "bg-red-50" : ""}`}>
                  <td className={`px-4 py-2 font-mono text-xs ${c.mappings.length === 0 ? "font-bold" : ""}`}>{c.ref}</td>
                  <td className="px-4 py-2">{c.theme}</td>
                  <td className="px-4 py-2 text-xs">{c.framework.name}</td>
                  <td className="px-4 py-2 text-center">{c.mappings.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
