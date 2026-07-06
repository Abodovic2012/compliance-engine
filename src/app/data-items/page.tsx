import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DataItemsPage(props: { searchParams: Promise<{ domain?: string }> }) {
  const params = await props.searchParams;
  const where: Record<string, string> = {};
  if (params.domain) where.domain = params.domain;
  const items = await prisma.dataItem.findMany({
    where,
    include: { _count: { select: { mappings: true } } },
    orderBy: { key: "asc" },
  });
  const domains = [...new Set(items.map((i) => i.domain))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data Items</h1>
        <div className="flex gap-2">
          {domains.map((d) => (
            <Link
              key={d}
              href={params.domain === d ? "/data-items" : `/data-items?domain=${encodeURIComponent(d)}`}
              className={`px-3 py-1 rounded-full text-xs ${params.domain === d ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"}`}
            >
              {d}
            </Link>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Key</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Label</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Domain</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Mappings</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{item.key}</td>
                <td className="px-4 py-3 font-medium">{item.label}</td>
                <td className="px-4 py-3 text-slate-500">{item.category}</td>
                <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{item.domain}</span></td>
                <td className="px-4 py-3 text-center">{item._count.mappings}</td>
                <td className="px-4 py-3"><Link href={`/data-items/${item.id}`} className="text-blue-600 hover:underline text-xs">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
