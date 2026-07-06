import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PolicyDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const framework = await prisma.framework.findUnique({ where: { id } });
  if (!framework) {
    return <div className="p-8 text-center text-slate-500">Framework not found</div>;
  }

  const controls = await prisma.control.findMany({
    where: { frameworkId: id },
    orderBy: { ref: "asc" },
  });

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div>
      <Link href="/policies" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Policies</Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{framework.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Version {framework.version} &middot; Region {framework.region}</p>
          </div>
          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 print:hidden">
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="text-center mb-8 pb-6 border-b border-slate-200">
          <h2 className="text-xl font-bold uppercase tracking-wider">{framework.name} Compliance Policy</h2>
          <p className="text-sm text-slate-500 mt-2">Generated: {generatedDate}</p>
          <p className="text-xs text-slate-400 mt-1">This policy document is derived from the official {framework.name} control requirements.</p>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-base mb-3">1.0 Purpose and Scope</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            This document establishes the compliance policy for <strong>{framework.name}</strong> (v{framework.version}, {framework.region}). 
            It defines mandatory requirements, responsibilities, and evidence criteria that shall be implemented and maintained 
            by the organization to achieve and demonstrate full compliance with the framework.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mt-3">
            This policy applies to all systems, personnel, processes, and third-party relationships within the scope of 
            the organization&apos;s compliance obligations under {framework.name}. All controls specified herein are mandatory 
            and shall be enforced across the enterprise.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-base mb-3">2.0 Policy Requirements</h3>
          <p className="text-sm text-slate-500 mb-4">
            The following controls define the specific requirements that shall be implemented to achieve compliance.
            Each control includes the mandatory requirement statement and compliance evidence criteria.
          </p>
          <div className="space-y-6">
            {controls.map((c, i) => (
              <div key={c.id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-slate-400 font-mono">{c.ref}</span>
                  <h4 className="font-medium text-sm">{c.theme}</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-base mb-3">3.0 Compliance and Enforcement</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Compliance with this policy shall be verified through regular internal audits, management reviews, 
            and independent assessments. Non-compliance shall be documented, escalated, and remediated within 
            defined SLA thresholds. Evidence of compliance shall be retained in accordance with the organization&apos;s 
            records retention schedule.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mt-3">
            The designated compliance officer shall ensure that all controls are implemented, maintained, and 
            continuously improved. Annual policy reviews shall be conducted to incorporate framework updates 
            and regulatory changes.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-3">4.0 Document History</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-500">Version</th>
                <th className="text-left px-3 py-2 font-medium text-slate-500">Date</th>
                <th className="text-left px-3 py-2 font-medium text-slate-500">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-3 py-2 font-mono text-xs">{framework.version}</td>
                <td className="px-3 py-2">{generatedDate}</td>
                <td className="px-3 py-2 text-slate-500">Initial policy generation from {framework.name} ({controls.length} controls)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
