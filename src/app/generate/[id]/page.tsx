"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface CompanyInfo {
  companyName: string;
  industry: string;
  companySize: string;
  scope: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  frameworkId: string;
}

interface Control {
  id: string;
  ref: string;
  theme: string;
  description: string;
}

interface FrameworkData {
  id: string;
  name: string;
  version: string;
  region: string;
}

export default function PolicyPreview(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const router = useRouter();
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [framework, setFramework] = useState<FrameworkData | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("policy-company");
    if (!raw) {
      router.replace("/generate");
      return;
    }
    const companyInfo = JSON.parse(raw) as CompanyInfo;
    if (companyInfo.frameworkId !== id) {
      router.replace("/generate");
      return;
    }
    setCompany(companyInfo);

    fetch(`/api/frameworks/${id}/controls`)
      .then((r) => r.json())
      .then((data: { framework: FrameworkData; controls: Control[] }) => {
        setFramework(data.framework);
        setControls(data.controls);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => window.print();

  const handleDownloadDocx = async () => {
    if (!company || !framework) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/generate/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          framework,
          controls,
          generatedDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate DOCX");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `${company.companyName.replace(/\s+/g, "_")}_Policy_${framework.name.replace(/\s+/g, "_")}.docx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("DOCX download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !company || !framework) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">Generating policy document...</div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #policy-content, #policy-content * { visibility: visible; }
          #policy-content { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0.5in; }
          .no-print { display: none !important; }
          @page { margin: 0.5in; }
          img { max-height: 40px; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .control-block { page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/generate")}
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Form
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
          >
            Print / Save PDF
          </button>
          <button
            onClick={handleDownloadDocx}
            disabled={downloading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {downloading ? "Generating..." : "Download DOCX"}
          </button>
        </div>
      </div>

      <div id="policy-content" className="bg-white rounded-xl border border-slate-200 p-8 max-w-[8.5in] mx-auto">
        <div className="text-center mb-8 pb-6 border-b-2 border-slate-300">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-10" />
            <span className="text-lg font-bold text-slate-800">Compliance Engine</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
            Compliance Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Document Ref: POL-{framework.name.substring(0, 3).toUpperCase()}-001
          </p>
        </div>

        <table className="w-full text-sm mb-8">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-2 pr-4 font-semibold text-slate-700 w-40">Company</td>
              <td className="py-2">{company.companyName}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 pr-4 font-semibold text-slate-700">Industry</td>
              <td className="py-2">{company.industry}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 pr-4 font-semibold text-slate-700">Company Size</td>
              <td className="py-2">{company.companySize}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 pr-4 font-semibold text-slate-700">Framework</td>
              <td className="py-2">{framework.name} v{framework.version} ({framework.region})</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 pr-4 font-semibold text-slate-700">Date</td>
              <td className="py-2">{generatedDate}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-8">
          <h2 className="font-bold text-base mb-3 text-slate-900">1.0 Purpose and Scope</h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            This document establishes the compliance policy for <strong>{company.companyName}</strong> ("the Organization"),
            governing its operations within the <strong>{company.industry}</strong> sector. This policy is derived from the
            <strong> {framework.name}</strong> v{framework.version} ({framework.region}) framework and defines the
            mandatory requirements, responsibilities, and evidence criteria that shall be implemented and maintained
            by the Organization to achieve and demonstrate full compliance.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            <strong>Scope of Application:</strong> {company.scope}
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            All personnel, systems, processes, and third-party relationships within the scope defined above
            shall comply with the requirements set forth in this policy. The {framework.name} framework comprises
            <strong> {controls.length} controls</strong>, each of which is addressed in Section 2.0 below.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="font-bold text-base mb-3 text-slate-900">2.0 Policy Requirements</h2>
          <p className="text-sm text-slate-500 mb-4">
            The following controls define the specific requirements that shall be implemented by {company.companyName}
            to achieve and maintain compliance with {framework.name}. Each control includes the reference identifier,
            thematic category, and the mandatory requirement statement.
          </p>
          <div className="space-y-5">
            {controls.map((c) => (
              <div key={c.id} className="control-block border-l-4 border-blue-200 pl-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-slate-400 font-mono font-medium">{c.ref}</span>
                  <h3 className="font-semibold text-sm text-slate-800">{c.theme}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-bold text-base mb-3 text-slate-900">3.0 Compliance and Enforcement</h2>
          <table className="w-full text-sm mb-4">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-semibold text-slate-700 w-44">Compliance Officer</td>
                <td className="py-2">{company.contactName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-semibold text-slate-700">Title</td>
                <td className="py-2">{company.contactTitle}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-semibold text-slate-700">Email</td>
                <td className="py-2">{company.contactEmail}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            Compliance with this policy shall be verified through regular internal audits, management reviews,
            and independent assessments conducted at intervals defined by the Organization&apos;s compliance
            program. Non-compliance shall be documented, escalated to the designated Compliance Officer, and
            remediated within defined SLA thresholds.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            The Compliance Officer shall ensure that all controls are implemented, maintained, and continuously
            improved. Annual policy reviews shall be conducted to incorporate framework updates, regulatory
            changes, and lessons learned from compliance assessments.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="font-bold text-base mb-3 text-slate-900">4.0 Document History</h2>
          <table className="w-full text-sm border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 font-semibold text-slate-600 border-b border-slate-200">Version</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-600 border-b border-slate-200">Date</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-600 border-b border-slate-200">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 font-mono text-xs border-b border-slate-100">1.0</td>
                <td className="px-3 py-2 border-b border-slate-100">{generatedDate}</td>
                <td className="px-3 py-2 text-slate-600 border-b border-slate-100">
                  Initial policy generation for {company.companyName} based on {framework.name} ({controls.length} controls)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-400">
          <p>Produced by Compliance Engine &mdash; Confidential</p>
          <p className="mt-1">This document is a generated compliance policy and should be reviewed by qualified professionals.</p>
        </div>
      </div>
    </div>
  );
}
