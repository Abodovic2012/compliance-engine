"use client";

import { useState, useEffect } from "react";
import { FrameworkBreakdown } from "./framework-breakdown";

interface ScopeControl {
  id: string;
  ref: string;
  theme: string;
  frameworkId: string;
  framework: { name: string; version: string; region: string };
}

interface ScopeMapping {
  id: string;
  justification: string;
  riskLevel: string;
  control: ScopeControl;
}

interface FrameworkCoverage {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  controlsCovered: number;
  totalControls: number;
  percentage: number;
  shareOfPlatform: number;
}

interface ScopeCoverage {
  totalControls: number;
  totalFrameworks: number;
  frameworks: FrameworkCoverage[];
}

interface Scope {
  id: string;
  provider: string;
  scopeId: string;
  displayName: string;
  description: string;
  category: string;
  adminConsentRequired: boolean;
  accessLevel: string;
  testProcedure: string | null;
  evidenceRequired: string | null;
  testReference: string | null;
  _count: { mappings: number };
  mappings: ScopeMapping[];
  coverage: ScopeCoverage;
}

interface CategoryAgg {
  category: string;
  _count: { category: number };
}

interface AssessmentRow {
  scopeId: string;
  state: string;
  mode: string;
}

const RISK_STYLE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const COVERAGE_BAR: Record<string, string> = {
  high: "from-emerald-400 to-teal-500",
  medium: "from-sky-400 to-indigo-500",
  low: "from-slate-300 to-slate-400",
};

function coverageTier(pct: number): string {
  if (pct >= 30) return "high";
  if (pct >= 10) return "medium";
  return "low";
}

function splitEvidence(evidence: string | null): string[] {
  if (!evidence) return ["No evidence guidance recorded."];
  return evidence
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ScopesPage() {
  const [tab, setTab] = useState<"permission" | "framework">("permission");
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [categories, setCategories] = useState<CategoryAgg[]>([]);
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<number, boolean>>>({});
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);

  const load = (params: URLSearchParams) => {
    fetch(`/api/scopes?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setScopes(data.scopes ?? []);
        setCategories((prev) =>
          prev.length > 0 ? prev : (data.categories ?? [])
        );
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load scopes");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("/api/scopes/assessment")
      .then((r) => r.json())
      .then((data) => setAssessments(data.assessments ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (provider) params.set("provider", provider);
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    load(params);
  }, [provider, category, q]);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleItem = (scopeId: string, idx: number) =>
    setCheckedItems((prev) => {
      const scopeItems = prev[scopeId] ?? {};
      return { ...prev, [scopeId]: { ...scopeItems, [idx]: !scopeItems[idx] } };
    });

  const grouped = [...new Set(scopes.map((s) => s.provider))];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">OAuth Scopes</h1>
      <p className="text-sm text-slate-500 mb-6">
        Google Workspace &amp; Microsoft 365 / Graph permissions, mapped to framework controls.
      </p>

      <div className="bg-white rounded-xl border border-slate-200 p-1 mb-6 inline-flex gap-1 shadow-sm">
        <button
          onClick={() => setTab("permission")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "permission"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          By permission
        </button>
        <button
          onClick={() => setTab("framework")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "framework"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          By framework
        </button>
      </div>

      {tab === "framework" ? (
        <FrameworkBreakdown />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All providers</option>
            <option value="google">Google Workspace</option>
            <option value="microsoft">Microsoft 365 / Graph</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>{c.category} ({c._count.category})</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. drive, mail.read, directory..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => { setProvider(""); setCategory(""); setQ(""); }}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      {loading && <div className="text-slate-400 text-sm">Loading...</div>}

      {!loading && !error && (
        <div className="space-y-6">
          {grouped.map((providerName) => {
            const providerScopes = scopes.filter((s) => s.provider === providerName);
            const providerLabel = providerName === "google" ? "Google Workspace" : "Microsoft 365 / Graph";
            return (
              <div key={providerName}>
                <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center justify-between">
                  <span>{providerLabel}</span>
                  <span className="text-sm font-normal text-slate-400">{providerScopes.length} scopes</span>
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {providerScopes.map((s) => {
                    const evidenceItems = splitEvidence(s.evidenceRequired);
                    const checked = checkedItems[s.id] ?? {};
                    const checkedCount = evidenceItems.filter((_, i) => checked[i]).length;
                    const allChecked = evidenceItems.length > 0 && checkedCount === evidenceItems.length;
                    const hasPartial = checkedCount > 0 && !allChecked;
                    const completedChecks = Object.values(assessments).filter(
                      (a) => a.scopeId === s.id
                    );
                    const status = allChecked
                      ? "compliant"
                      : hasPartial
                        ? "in-progress"
                        : "not-verified";
                    return (
                      <div key={s.id} className="border-b border-slate-100 last:border-0">
                        <button
                          onClick={() => toggle(s.id)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-sm font-mono text-blue-700">{s.scopeId}</code>
                              {s.adminConsentRequired && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                  Admin consent
                                </span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                s.accessLevel === "read" ? "bg-slate-100 text-slate-600"
                                : s.accessLevel === "readwrite" ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                              }`}>
                                {s.accessLevel}
                              </span>
                            </div>
                            <div className="text-sm text-slate-700 mt-1">{s.displayName}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {s.category} · covers {s.coverage.totalControls} controls across {s.coverage.totalFrameworks} frameworks
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400">
                              {s._count.mappings} controls
                            </span>
                            <span className="text-slate-300">{expanded[s.id] ? "−" : "+"}</span>
                          </div>
                        </button>
                        {expanded[s.id] && (
                          <div className="px-4 pb-5 pt-1 bg-slate-50/50">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-3">
                                  <div className="text-2xl font-bold text-blue-700">{s.coverage.totalControls}</div>
                                  <div className="text-xs text-slate-500 font-medium">Controls covered</div>
                                </div>
                                <div className="rounded-lg bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 p-3">
                                  <div className="text-2xl font-bold text-violet-700">{s.coverage.totalFrameworks}</div>
                                  <div className="text-xs text-slate-500 font-medium">Frameworks impacted</div>
                                </div>
                                <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-3">
                                  <div className="text-2xl font-bold text-emerald-700">
                                    {s.coverage.frameworks.length > 0
                                      ? s.coverage.frameworks[0].percentage + "%"
                                      : "0%"}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium">Best framework coverage</div>
                                </div>
                                <div className="rounded-lg bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-3">
                                  <div className="text-2xl font-bold text-rose-700">
                                    {s.coverage.frameworks.length > 0
                                      ? (s.coverage.frameworks[s.coverage.frameworks.length - 1].percentage ?? 0) + "%"
                                      : "0%"}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium">Lowest framework coverage</div>
                                </div>
                              </div>

                              <div className="text-sm font-medium text-slate-700 mb-2">
                                Coverage per framework
                              </div>
                              {s.coverage.frameworks.length === 0 ? (
                                <div className="text-xs text-slate-400">No framework mappings.</div>
                              ) : (
                                <div className="space-y-2">
                                  {s.coverage.frameworks.map((fw) => (
                                    <div key={fw.frameworkId} className="flex items-center gap-3">
                                      <div className="w-44 shrink-0 text-xs text-slate-600 truncate" title={fw.frameworkName}>
                                        {fw.frameworkName}
                                        {fw.version ? ` ${fw.version}` : ""}
                                      </div>
                                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-2.5 rounded-full bg-gradient-to-r transition-all ${COVERAGE_BAR[coverageTier(fw.percentage)]}`}
                                          style={{ width: `${Math.max(3, fw.percentage)}%` }}
                                        />
                                      </div>
                                      <div className="w-24 shrink-0 text-right text-xs text-slate-500">
                                        <span className="font-semibold text-slate-700">{fw.percentage}%</span>
                                        {" · "}{fw.controlsCovered}/{fw.totalControls}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
                                  How to test
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {s.testProcedure ?? "No test procedure recorded for this permission."}
                                </p>
                              </div>
                              <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-bold">2</span>
                                  Audit reference
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {s.testReference ?? "No reference recorded for this permission."}
                                </p>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">3</span>
                                Evidence &amp; compliance check
                                <span className={`ml-auto text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                                  status === "compliant"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : status === "in-progress"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-500"
                                }`}>
                                  {allChecked
                                    ? "✓ In scope · compliant"
                                    : hasPartial
                                      ? "◐ Partially verified"
                                      : "Not verified"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mb-3">
                                Tick each item you can produce for this permission. When all items are collected, this
                                permission is considered compliant and ready for audit evidence.
                              </p>
                              <div className="space-y-2">
                                {evidenceItems.map((item, i) => (
                                  <label
                                    key={i}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                      checked[i]
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-slate-50 border-slate-200 hover:bg-white"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!!checked[i]}
                                      onChange={() => toggleItem(s.id, i)}
                                      className="mt-0.5 accent-emerald-600"
                                    />
                                    <span className={`text-xs ${checked[i] ? "text-emerald-800 line-through decoration-emerald-300" : "text-slate-700"}`}>
                                      {item}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                                <span>
                                  {checkedCount}/{evidenceItems.length} evidence items collected
                                </span>
                                {completedChecks.length > 0 && (
                                  <span>
                                    Marked in scorecard:{" "}
                                    {completedChecks.map((a) => `${a.mode}=${a.state}`).join(", ")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {s.mappings.length > 0 && (
                              <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4">
                                <div className="text-xs font-medium text-slate-700 mb-2">Mapped controls by framework:</div>
                                {Object.entries(
                                  s.mappings.reduce<Record<string, ScopeMapping[]>>((acc, m) => {
                                    const fw = m.control.framework.name;
                                    (acc[fw] = acc[fw] || []).push(m);
                                    return acc;
                                  }, {})
                                ).map(([fw, ms]) => (
                                  <div key={fw} className="mb-2">
                                    <div className="text-[11px] text-slate-500 font-medium mb-1">{fw}</div>
                                    <div className="flex flex-wrap gap-2">
                                      {ms.map((m) => (
                                        <span
                                          key={m.id}
                                          title={`${m.justification}`}
                                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]"
                                        >
                                          {m.control.ref} · {m.control.theme}
                                          <span className={`px-1 rounded text-[9px] font-medium ${RISK_STYLE[m.riskLevel] ?? RISK_STYLE.medium}`}>
                                            {m.riskLevel}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}