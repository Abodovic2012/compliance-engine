"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Framework {
  id: string;
  name: string;
  version: string;
  region: string;
  _count: { controls: number };
}

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
];

export default function GenerateForm() {
  const router = useRouter();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [frameworkName, setFrameworkName] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    scope: "",
    contactName: "",
    contactTitle: "",
    contactEmail: "",
    frameworkId: "",
  });

  useEffect(() => {
    fetch("/api/frameworks")
      .then((r) => r.json())
      .then((data: Framework[]) => {
        setFrameworks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFrameworkChange = (id: string) => {
    const fw = frameworks.find((f) => f.id === id);
    setFrameworkName(fw?.name ?? "");
    setForm((prev) => ({ ...prev, frameworkId: id }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.frameworkId || !form.companyName) return;
    sessionStorage.setItem("policy-company", JSON.stringify(form));
    router.push(`/generate/${form.frameworkId}`);
  };

  const label = "block text-sm font-medium text-slate-700 mb-1";
  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const select =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Generate Compliance Policy</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in your company details and select a framework to generate a personalized policy document.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <label className={label}>Company Name *</label>
            <input
              className={input}
              placeholder="e.g. Acme Corporation"
              value={form.companyName}
              onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={label}>Industry / Sector *</label>
            <input
              className={input}
              placeholder="e.g. Healthcare, Finance"
              value={form.industry}
              onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={label}>Company Size *</label>
            <select
              className={select}
              value={form.companySize}
              onChange={(e) => setForm((p) => ({ ...p, companySize: e.target.value }))}
              required
            >
              <option value="">Select size</option>
              {companySizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={label}>Scope of Compliance *</label>
            <textarea
              className={`${input} resize-none`}
              rows={3}
              placeholder="e.g. All IT systems and data processing activities within the organization"
              value={form.scope}
              onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mb-6">
          <h2 className="font-semibold text-sm mb-3">Responsible Person</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Full Name *</label>
              <input
                className={input}
                placeholder="e.g. John Doe"
                value={form.contactName}
                onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={label}>Job Title *</label>
              <input
                className={input}
                placeholder="e.g. Chief Compliance Officer"
                value={form.contactTitle}
                onChange={(e) => setForm((p) => ({ ...p, contactTitle: e.target.value }))}
                required
              />
            </div>
            <div className="col-span-2">
              <label className={label}>Email *</label>
              <input
                className={input}
                type="email"
                placeholder="e.g. john.doe@acme.com"
                value={form.contactEmail}
                onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mb-6">
          <h2 className="font-semibold text-sm mb-3">Compliance Framework</h2>
          <div>
            <label className={label}>Select Framework *</label>
            {loading ? (
              <div className="text-sm text-slate-400">Loading frameworks...</div>
            ) : (
              <select
                className={select}
                value={form.frameworkId}
                onChange={(e) => handleFrameworkChange(e.target.value)}
                required
              >
                <option value="">Choose a framework</option>
                {frameworks.map((fw) => (
                  <option key={fw.id} value={fw.id}>
                    {fw.name} v{fw.version} ({fw.region}) &mdash; {fw._count.controls} controls
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!form.frameworkId || !form.companyName}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Generate Policy Document
        </button>
      </form>
    </div>
  );
}
