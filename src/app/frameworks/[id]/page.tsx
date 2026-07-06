import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FrameworkPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const framework = await prisma.framework.findUnique({ where: { id } });
  if (!framework) {
    return <div className="p-8 text-center text-slate-500">Framework not found</div>;
  }
  const controls = await prisma.control.findMany({
    where: { frameworkId: id },
    include: { _count: { select: { mappings: true } } },
    orderBy: { ref: "asc" },
  });

  return (
    <div>
      <Link href="/frameworks" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Frameworks</Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h1 className="text-xl font-bold">{framework.name}</h1>
        <div className="flex gap-3 text-sm text-slate-500 mt-2">
          <span>Version: {framework.version}</span>
          <span>Region: {framework.region}</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Ref</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Theme</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Description</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Mappings</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><Link href={`/controls/${c.id}`} className="font-mono text-xs font-medium text-blue-600 hover:underline">{c.ref}</Link></td>
                <td className="px-4 py-3">{c.theme}</td>
                <td className="px-4 py-3 text-slate-500">{c.description}</td>
                <td className="px-4 py-3 text-center">{c._count.mappings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
