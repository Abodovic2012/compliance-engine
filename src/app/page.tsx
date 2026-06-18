import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  const [items, frameworks, mappings] = await Promise.all([
    prisma.dataItem.findMany({ select: { domain: true } }),
    prisma.framework.findMany({ select: { id: true } }),
    prisma.mapping.findMany({ select: { id: true } }),
  ]);
  const domains = [...new Set(items.map((i) => i.domain))];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Compliance Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Data Items" value={items.length} color="blue" />
        <StatCard label="Frameworks" value={frameworks.length} color="green" />
        <StatCard label="Mappings" value={mappings.length} color="purple" />
        <StatCard label="Domains" value={domains.length} color="orange" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/data-items" className="block px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm">Browse Data Items</Link>
            <Link href="/frameworks" className="block px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm">View Frameworks</Link>
            <Link href="/evaluate" className="block px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm">Evaluate Compliance</Link>
            <Link href="/reports" className="block px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm">Generate Reports</Link>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold mb-3">Domains ({domains.length})</h2>
          <div className="flex flex-wrap gap-2">
            {domains.map((d) => (
              <Link key={d} href={`/data-items?domain=${encodeURIComponent(d)}`} className="px-3 py-1 bg-slate-100 rounded-full text-xs hover:bg-slate-200">
                {d}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color] || colors.blue}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  );
}
