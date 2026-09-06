"use client";

import { useState, useEffect, useCallback } from "react";

type Mode = "checklist" | "inventory";

interface ScopeFrameworkRef {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  riskLevel: string;
  controls: number;
}

interface ScopeItem {
  id: string;
  provider: string;
  scopeId: string;
  displayName: string;
  category: string;
  accessLevel: string;
  adminConsentRequired: boolean;
  testProcedure: string | null;
  evidenceRequired: string | null;
  testReference: string | null;
  assessment: { state: string; notes: string | null; evidence: string | null } | null;
  frameworks: ScopeFrameworkRef[];
}

interface FrameworkScore {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  mode: Mode;
  relevantScopes: number;
  assessedScopes: number;
  compliant: number;
  partial: number;
  notCompliant: number;
  percentage: number;
  status: string;
}

interface WeakPoint {
  frameworkId: string;
  frameworkName: string;
  scopeId: string;
  provider: string;
  displayName: string;
  category: string;
  accessLevel: string;
  state: string;
  riskLevel: string;
  associatedControls: number;
}

interface Report {
  mode: Mode;
  generatedAt: string;
  frameworks: FrameworkScore[];
  weakPoints: WeakPoint[];
  overall: number;
  scopes: ScopeItem[];
}

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google Workspace",
  microsoft: "Microsoft 365 / Graph",
};

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

const RISK_STYLE: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

export default function AssessmentPage() {
  const [mode, setMode] = useState<Mode>("checklist");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFw, setExpandedFw] = useState<Record<string, boolean>>({});
  const [expandedScope, setExpandedScope] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const load = useCallback((m: Mode) => {
    fetch(`/api/assessment/report?mode=${m}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReport(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assessment report");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load(mode);
  }, [mode, load]);

  const saveState = async (scope: ScopeItem, state: string) => {
    const key = `${scope.id}:${state}`;
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("/api/scopes/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopeId: scope.id, mode, state }),
      });
      if (!res.ok) throw new Error("save failed");
      load(mode);
    } catch {
      setError("Failed to save assessment");
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toggleFw = (id: string) =>
    setExpandedFw((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleScope = (id: string) =>
    setExpandedScope((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!report) return <div className="text-slate-400 text-sm">No data</div>;

  const scopeList = report.scopes.filter((s) => s.frameworks.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Compliance Scorecard</h1>
      <p className="text-sm text-slate-500 mb-6">
        SaaS-only assessment of OAuth/Grant permissions against each framework. Mark each mapped
        permission, then review weak points and per-framework compliance.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-1 flex">
          {(["checklist", "inventory"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {m === "checklist" ? "Checklist mode" : "Inventory mode"}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-400">
          {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : ""}
        </div>
      </div>

      {mode === "inventory" && (
        <p className="text-sm text-slate-500 mb-4">
          Inventory mode: mark which permissions are actually granted in your tenant. Percentages reflect
          granted permissions vs. those required by each framework.
        </p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall compliance</span>
          <span className="text-2xl font-bold text-slate-800">{report.overall}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${BAR_STYLE[statusFor(report.overall)]}`}
            style={{ width: `${report.overall}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{report.frameworks.length} frameworks in scope</span>
          <span>
            {report.scopes.filter((s) => s.assessment?.state != null && s.assessment?.state !== "").length}
            /{report.scopes.length} permissions assessed
          </span>
        </div>
      </div>

      {report.weakPoints.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-3">
            Weak points ({report.weakPoints.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {report.weakPoints
              .slice(0, 12)
              .map((w, i) => (
                <div key={i} className="py-2 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm text-slate-700">
                      <span className="font-medium">{w.displayName}</span>
                      <span className="text-slate-400"> · {w.frameworkName}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {w.provider === "google" ? "Google Workspace" : "Microsoft 365"}
                      {w.accessLevel ? " · " + w.accessLevel : ""}
                      {w.associatedControls ? " · " + w.associatedControls + " controls" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${RISK_STYLE[w.riskLevel] ?? RISK_STYLE.medium}`}>
                      {w.riskLevel}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Frameworks</h2>
      <div className="space-y-4">
        {report.frameworks.map((fw) => {
          const fwScopes = scopeList.filter((s) =>
            s.frameworks.some((f) => f.frameworkId === fw.frameworkId)
          );
          return (
            <div key={fw.frameworkId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFw(fw.frameworkId)}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{fw.frameworkName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[fw.status]}`}>
                      {fw.status}
                    </span>
                    {(fw.version || fw.region) && (
                      <span className="text-xs text-slate-400">
                        {fw.version} · {fw.region}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {fw.relevantScopes} relevant permissions · {fw.compliant} compliant
                    {mode === "checklist" && fw.partial > 0 ? ` · ${fw.partial} partial` : ""}
                    {fw.notCompliant > 0 ? ` · ${fw.notCompliant} not compliant` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-48">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${BAR_STYLE[fw.status]}`}
                      style={{ width: `${fw.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-10 text-right">
                    {fw.percentage}%
                  </span>
                  <span className="text-slate-300">{expandedFw[fw.frameworkId] ? "−" : "+"}</span>
                </div>
              </button>

              {expandedFw[fw.frameworkId] && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                  {fwScopes.length === 0 ? (
                    <div className="text-xs text-slate-400">No mapped permissions.</div>
                  ) : (
                    <div className="space-y-2">
                      {fwScopes.map((s) => {
                        const fwRef = s.frameworks.find((f) => f.frameworkId === fw.frameworkId)!;
                        const state = s.assessment?.state ?? "";
                        const options = mode === "checklist" ? ["done", "partial", "notdone"] : ["granted", "notgranted"];
                        return (
                          <div key={s.id} className="bg-white rounded-lg border border-slate-200">
                            <button
                              onClick={() => toggleScope(s.id)}
                              className="w-full text-left px-3 py-2.5 flex items-start justify-between gap-3 hover:bg-slate-50"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <code className="text-sm font-mono text-blue-700">{s.scopeId}</code>
                                  <span className="text-xs text-slate-400">{s.category}</span>
                                </div>
                                <div className="text-sm text-slate-700 mt-0.5">{s.displayName}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${RISK_STYLE[fwRef.riskLevel] ?? RISK_STYLE.medium}`}>
                                  {fwRef.riskLevel}
                                </span>
                                <span className="text-xs text-slate-400">{fwRef.controls} controls</span>
                              </div>
                            </button>

                            <div className="px-3 pb-3 flex flex-wrap gap-2">
                              {options.map((opt) => (
                                <button
                                  key={opt}
                                  disabled={saving[`${s.id}:${opt}`]}
                                  onClick={() => saveState(s, opt)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                                    state === opt
                                      ? opt === "done" || opt === "granted"
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : opt === "partial"
                                          ? "bg-amber-500 text-white border-amber-500"
                                          : "bg-red-600 text-white border-red-600"
                                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>

                            {expandedScope[s.id] && (
                              <div className="px-3 pb-3 text-xs text-slate-600 space-y-3">
                                {s.testProcedure && (
                                  <div>
                                    <div className="font-medium text-slate-700 mb-1">How to test</div>
                                    <p>{s.testProcedure}</p>
                                  </div>
                                )}
                                {s.evidenceRequired && (
                                  <div>
                                    <div className="font-medium text-slate-700 mb-1">Evidence to collect</div>
                                    <p>{s.evidenceRequired}</p>
                                  </div>
                                )}
                                {s.testReference && (
                                  <div>
                                    <div className="font-medium text-slate-700 mb-1">Reference</div>
                                    <p>{s.testReference}</p>
                                  </div>
                                )}
                                <div className="text-xs text-slate-400">
                                  {PROVIDER_LABEL[s.provider] ?? s.provider}
                                  {s.accessLevel ? " · " + s.accessLevel : ""}
                                  {s.adminConsentRequired ? " · admin consent required" : ""}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
}

function statusFor(pct: number): string {
  if (pct >= 90) return "compliant";
  if (pct >= 70) return "partially-compliant";
  if (pct >= 40) return "at-risk";
  return "non-compliant";
}