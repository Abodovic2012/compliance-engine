"use client";

import { useState, useEffect, useCallback } from "react";
import { SegmentedDonut } from "@/components/audit-viz";

type Tab = "assessment" | "breakdown";

interface AuditControl {
  id: string;
  ref: string;
  theme: string;
  description: string;
  auditArea: string | null;
  auditScope: string | null;
  auditProcedure: string | null;
  evidenceRequired: string | null;
  auditTestRef: string | null;
  framework: { id: string; name: string; version: string; region: string };
  audit: { status: string; evidence: string | null; notes: string | null } | null;
  mappingsCount: number;
  mappings: { severity: string; findingType: string; dataItem: { name: string } }[];
  scopeRefs: { provider: string; scopeId: string; displayName: string }[];
}

interface FrameworkScore {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  totalControls: number;
  assessedControls: number;
  compliant: number;
  partial: number;
  noncompliant: number;
  notstarted: number;
  percentage: number;
  status: string;
}

interface FrameworkBreakdown {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  totalControls: number;
  controlsWithMappings: number;
  controlsWithoutMappings: number;
  mappingCoveragePercent: number;
  totalMappings: number;
  totalDataItems: number;
  compliant: number;
  partial: number;
  noncompliant: number;
  notstarted: number;
  assessedPercent: number;
  auditPercent: number;
  categories: {
    theme: string;
    totalControls: number;
    compliant: number;
    partial: number;
    noncompliant: number;
    notstarted: number;
    assessedPercent: number;
  }[];
  topWeakControls: {
    controlId: string;
    ref: string;
    theme: string;
    status: string;
    severity: string;
    evidenceMissing: boolean;
  }[];
  riskDistribution: Record<string, number>;
  auditScopes: string[];
  oauthScopes: {
    provider: string;
    scopeId: string;
    displayName: string;
  }[];
}

interface Report {
  scorecard: {
    generatedAt: string;
    totalControls: number;
    assessedControls: number;
    frameworks: FrameworkScore[];
    weakPoints: unknown[];
    overall: number;
  };
  breakdown: {
    generatedAt: string;
    totals: {
      frameworks: number;
      totalControls: number;
      assessedControls: number;
      overallAuditPercent: number;
      overallMappingCoveragePercent: number;
      totalMappings: number;
    };
    frameworks: FrameworkBreakdown[];
  };
}

const STATUS_STYLE: Record<string, string> = {
  compliant: "bg-emerald-100 text-emerald-700",
  "partially-compliant": "bg-amber-100 text-amber-700",
  "at-risk": "bg-orange-100 text-orange-700",
  "non-compliant": "bg-red-100 text-red-700",
};

const BAR_STYLE: Record<string, string> = {
  compliant: "bg-emerald-500",
  "partially-compliant": "bg-amber-500",
  "at-risk": "bg-orange-500",
  "non-compliant": "bg-red-500",
};

const SEG_COLORS: Record<string, string> = {
  compliant: "#10b981",
  partial: "#f59e0b",
  noncompliant: "#ef4444",
  notstarted: "#94a3b8",
};

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

function statusFor(pct: number): string {
  if (pct >= 90) return "compliant";
  if (pct >= 70) return "partially-compliant";
  if (pct >= 40) return "at-risk";
  return "non-compliant";
}

export default function AuditPage() {
  const [tab, setTab] = useState<Tab>("assessment");
  const [controls, setControls] = useState<AuditControl[]>([]);
  const [frameworks, setFrameworks] = useState<{ id: string; name: string }[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [evidenceDraft, setEvidenceDraft] = useState<Record<string, string | undefined>>({});
  const [notesDraft, setNotesDraft] = useState<Record<string, string | undefined>>({});

  const loadReport = useCallback(() => {
    fetch("/api/audit/report")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReport(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load audit report");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setControls(data.controls);
        setFrameworks(data.frameworks);
        setAreas(data.areas);
        return data;
      })
      .then(() => loadReport())
      .catch(() => setError("Failed to load audit data"));
  }, [loadReport]);

  const saveStatus = async (control: AuditControl, status: string) => {
    const key = `${control.id}:${status}`;
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("/api/audit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controlId: control.id,
          status,
          evidence: evidenceDraft[control.id],
          notes: notesDraft[control.id],
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setEvidenceDraft((prev) => ({ ...prev, [control.id]: undefined }));
      setNotesDraft((prev) => ({ ...prev, [control.id]: undefined }));
      loadReport();
      fetch("/api/audit")
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) {
            setControls(data.controls);
            setAreas(data.areas);
          }
        })
        .catch(() => {});
    } catch {
      setError("Failed to save audit status");
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toggleCtrl = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const themes = [...new Set(controls.map((c) => c.theme))].sort();

  const filtered = controls.filter((c) => {
    if (frameworkFilter !== "all" && c.framework.id !== frameworkFilter) return false;
    if (areaFilter !== "all" && c.auditArea !== areaFilter) return false;
    if (themeFilter !== "all" && c.theme !== themeFilter) return false;
    const status = c.audit?.status ?? "notstarted";
    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (
      search &&
      ![c.ref, c.theme, c.description, c.auditArea ?? "", c.auditScope ?? ""].some((f) =>
        f.toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;
    return true;
  });

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!report) return <div className="text-slate-400 text-sm">No data</div>;

  const score = report.scorecard;
  const breakdown = report.breakdown;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Audit &amp; Compliance Assessment</h1>
      <p className="text-sm text-slate-500 mb-6">
        Audit-based scoring: assess each control of every framework against its test procedure, collect
        evidence, and track compliance. Weak points and per-framework health update live.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1">
          {(["assessment", "breakdown"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t === "assessment" ? "By control" : "Framework breakdown"}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-400">
          {score.generatedAt ? new Date(score.generatedAt).toLocaleString() : ""}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 mb-6 text-white flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-sm text-slate-300 mb-1">Overall audit score</div>
          <div className="text-4xl font-extrabold">{score.overall}%</div>
          <div className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusPill(score.overall)}`}>
            {statusFor(score.overall)}
          </div>
        </div>
        <div className="flex-1 min-w-[240px]">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${statusBar(score.overall)}`}
              style={{ width: `${score.overall}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-300 mt-2">
            <span>{score.totalControls} controls across {score.frameworks.length} frameworks</span>
            <span>{score.assessedControls} assessed</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs">
          <div>
            <div className="text-slate-300">Mappings in scope</div>
            <div className="text-xl font-bold">{breakdown.totals.totalMappings.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-300">Mapping coverage</div>
            <div className="text-xl font-bold">{breakdown.totals.overallMappingCoveragePercent}%</div>
          </div>
        </div>
      </div>

      {tab === "breakdown" && <BreakdownView breakdown={breakdown} />}

      {tab === "assessment" && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 grid gap-3 md:grid-cols-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref, theme, area, description..."
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="all">All frameworks</option>
              {frameworks.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="all">All audit areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="all">All themes</option>
              {themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="all">Any status</option>
              <option value="compliant">Compliant</option>
              <option value="partial">Partially compliant</option>
              <option value="noncompliant">Non-compliant</option>
              <option value="notstarted">Not assessed</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 mb-3">
            {filtered.length} of {controls.length} controls shown
          </div>

          <div className="space-y-3">
            {filtered.map((c) => {
              const status = c.audit?.status ?? "notstarted";
              return (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleCtrl(c.id)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-blue-700">{c.ref}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusPillForStatus(status)}`}>
                          {status}
                        </span>
                        <span className="text-xs text-slate-400">{c.framework.name}</span>
                      </div>
                      <div className="text-sm text-slate-700 mt-0.5 line-clamp-1">{c.theme}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {c.auditArea && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                            {c.auditArea}
                          </span>
                        )}
                        {c.auditScope && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                            Scope: {c.auditScope}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">{c.mappingsCount} mappings</span>
                      <span className="text-slate-300">{expanded[c.id] ? "−" : "+"}</span>
                    </div>
                  </button>

                  {expanded[c.id] && (
                    <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                      <p className="text-xs text-slate-600">{c.description}</p>
                      {c.scopeRefs.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                          <div className="font-medium text-slate-700 mb-1">Audit reference</div>
                          <p className="text-[10px] text-slate-400 mb-1">
                            Informational only - not used in scoring.
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {c.scopeRefs.map((s) => (
                              <span
                                key={s.scopeId}
                                title={s.scopeId}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px]"
                              >
                                {s.displayName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.auditProcedure && (
                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                          <div className="font-medium text-slate-700 mb-1">How to test</div>
                          <p>{c.auditProcedure}</p>
                        </div>
                      )}
                      {c.evidenceRequired && (
                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                          <div className="font-medium text-slate-700 mb-1">Evidence to collect</div>
                          <p>{c.evidenceRequired}</p>
                        </div>
                      )}
                      {c.auditTestRef && (
                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                          <div className="font-medium text-slate-700 mb-1">Reference</div>
                          <p>{c.auditTestRef}</p>
                        </div>
                      )}

                      <div className="grid gap-2 md:grid-cols-2">
                        <textarea
                          defaultValue={c.audit?.evidence ?? ""}
                          placeholder="Evidence collected (optional)"
                          onChange={(e) =>
                            setEvidenceDraft((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          rows={2}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          defaultValue={c.audit?.notes ?? ""}
                          placeholder="Notes (optional)"
                          onChange={(e) =>
                            setNotesDraft((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          rows={2}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(["compliant", "partial", "noncompliant", "notstarted"] as const).map((opt) => (
                          <button
                            key={opt}
                            disabled={saving[`${c.id}:${opt}`]}
                            onClick={() => saveStatus(c, opt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                              status === opt
                                ? opt === "compliant"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : opt === "partial"
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : opt === "noncompliant"
                                      ? "bg-red-600 text-white border-red-600"
                                      : "bg-slate-500 text-white border-slate-500"
                                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownView({ breakdown }: { breakdown: Report["breakdown"] }) {
  const [fwExpanded, setFwExpanded] = useState<Record<string, boolean>>({});
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MiniStat label="Controls" value={breakdown.totals.totalControls} />
        <MiniStat label="Assessed" value={breakdown.totals.assessedControls} />
        <MiniStat label="Mappings" value={breakdown.totals.totalMappings.toLocaleString()} />
      </div>
      <div className="space-y-4">
        {breakdown.frameworks.map((fw) => {
          const segs = [
            { value: fw.compliant, color: SEG_COLORS.compliant },
            { value: fw.partial, color: SEG_COLORS.partial },
            { value: fw.noncompliant, color: SEG_COLORS.noncompliant },
            { value: fw.notstarted, color: SEG_COLORS.notstarted },
          ].filter((s) => s.value > 0);
          return (
            <div key={fw.frameworkId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setFwExpanded((p) => ({ ...p, [fw.frameworkId]: !p[fw.frameworkId] }))}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 flex flex-wrap items-center gap-6"
              >
                <SegmentedDonut segments={segs} size={110} />
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{fw.frameworkName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[statusFor(fw.auditPercent)]}`}>
                      {statusFor(fw.auditPercent)}
                    </span>
                    <span className="text-xs text-slate-400">{fw.version} · {fw.region}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {fw.compliant} compliant · {fw.partial} partial · {fw.noncompliant} non-compliant · {fw.notstarted} not assessed
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${BAR_STYLE[statusFor(fw.auditPercent)]}`} style={{ width: `${fw.auditPercent}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{fw.auditPercent}%</span>
                  </div>
                </div>
                <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500">
                  <div><span className="font-medium text-slate-600">{fw.mappingCoveragePercent}%</span> mapped</div>
                  <div><span className="font-medium text-slate-600">{fw.assessedPercent}%</span> assessed</div>
                  <div><span className="font-medium text-slate-600">{fw.totalDataItems}</span> data items</div>
                  <div><span className="font-medium text-slate-600">{fw.totalMappings}</span> mappings</div>
                </div>
                <span className="text-slate-300">{fwExpanded[fw.frameworkId] ? "−" : "+"}</span>
              </button>

              {fwExpanded[fw.frameworkId] && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                  <div className="grid gap-4 lg:grid-cols-2 mb-6">
                    <div className="bg-white rounded-lg border border-slate-200 p-3">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Audit scopes</h3>
                      {fw.auditScopes.length === 0 ? (
                        <div className="text-xs text-slate-400">No audit scopes.</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {fw.auditScopes.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-3">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        OAuth scopes (permissions) · {fw.oauthScopes.length}
                      </h3>
                      {fw.oauthScopes.length === 0 ? (
                        <div className="text-xs text-slate-400">No OAuth scope references.</div>
                      ) : (
                        <ScopeGroupedScopes scopes={fw.oauthScopes} />
                      )}
                    </div>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Categories</h3>
                      <div className="space-y-2">
                        {fw.categories.map((cat) => (
                          <div key={cat.theme} className="bg-white rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-600">{cat.theme}</span>
                              <span className="text-xs text-slate-400">
                                {cat.compliant}/{cat.totalControls} compliant
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${cat.assessedPercent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Weak controls</h3>
                      {fw.topWeakControls.length === 0 ? (
                        <div className="text-xs text-slate-400">No weak controls.</div>
                      ) : (
                        <div className="space-y-2">
                          {fw.topWeakControls.map((w) => (
                            <div key={w.controlId} className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-700">{w.ref} <span className="text-slate-400">· {w.theme}</span></div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SEVERITY_STYLE[w.severity] ?? SEVERITY_STYLE.low}`}>
                                  {w.severity}
                                </span>
                                {w.evidenceMissing && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">no evidence</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScopeGroupedScopes({
  scopes,
}: {
  scopes: { provider: string; scopeId: string; displayName: string }[];
}) {
  const groups = new Map<string, { scopeId: string; displayName: string }[]>();
  for (const s of scopes) {
    const list = groups.get(s.provider) ?? [];
    list.push({ scopeId: s.scopeId, displayName: s.displayName });
    groups.set(s.provider, list);
  }
  const providerLabel = (p: string) =>
    p === "google" ? "Google Workspace" : p === "microsoft" ? "Microsoft 365 / Graph" : p;
  return (
    <div className="space-y-2">
      {[...groups.entries()].map(([provider, list]) => (
        <div key={provider}>
          <div className="text-[10px] font-medium text-slate-400 mb-1">
            {providerLabel(provider)} ({list.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {list.map((s) => (
              <span
                key={s.scopeId}
                title={s.scopeId}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px]"
              >
                {s.displayName}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function statusPill(pct: number): string {
  return STATUS_STYLE[statusFor(pct)] ?? "bg-slate-200 text-slate-600";
}

function statusBar(pct: number): string {
  return BAR_STYLE[statusFor(pct)] ?? "bg-slate-400";
}

function statusPillForStatus(s: string): string {
  if (s === "compliant") return "bg-emerald-100 text-emerald-700";
  if (s === "partial") return "bg-amber-100 text-amber-700";
  if (s === "noncompliant") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-500";
}