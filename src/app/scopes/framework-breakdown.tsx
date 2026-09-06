"use client";

import { useState, useEffect } from "react";

interface CategoryBreakdown {
  category: string;
  mappings: number;
  coveredControls: number;
  sharePercent: number;
}

interface TopScope {
  scopeId: string;
  displayName: string;
  provider: string;
  controlsCovered: number;
  coveragePercent: number;
}

interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface FrameworkCoverage {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  totalControls: number;
  controlsWithScope: number;
  controlsWithoutScope: number;
  coveragePercent: number;
  totalScopeMappings: number;
  distinctScopes: number;
  categories: CategoryBreakdown[];
  topScopes: TopScope[];
  riskDistribution: RiskDistribution;
}

interface Report {
  totals: {
    frameworks: number;
    totalControls: number;
    controlsWithScope: number;
    controlsWithoutScope: number;
    overallCoveragePercent: number;
    totalScopeMappings: number;
    distinctScopes: number;
  };
  frameworks: FrameworkCoverage[];
}

const RISK_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

const CATEGORY_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-purple-600",
  "from-lime-500 to-green-600",
];

function statusFor(pct: number): { label: string; cls: string; ring: string } {
  if (pct >= 70) return { label: "Strong", cls: "bg-emerald-100 text-emerald-700", ring: "#10b981" };
  if (pct >= 40) return { label: "Partial", cls: "bg-amber-100 text-amber-700", ring: "#f59e0b" };
  if (pct >= 10) return { label: "Weak", cls: "bg-orange-100 text-orange-700", ring: "#f97316" };
  return { label: "No scope coverage", cls: "bg-red-100 text-red-700", ring: "#ef4444" };
}

function Donut({ pct, size = 120, stroke = 12 }: { pct: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const st = statusFor(pct);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={st.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{pct}%</span>
        <span className="text-[10px] text-slate-400 font-medium">covered</span>
      </div>
    </div>
  );
}

export function FrameworkBreakdown() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/scopes/platform-coverage")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setReport(data);
        setLoading(false);
        const t = window.setTimeout(() => setAnimate(true), 100);
        return () => window.clearTimeout(t);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load framework coverage");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-slate-400 text-sm py-8 text-center">Loading...</div>;
  if (error) return <div className="text-red-600 text-sm py-8 text-center">{error}</div>;
  if (!report) return <div className="text-slate-400 text-sm py-8 text-center">No data</div>;

  const t = report.totals;
  const overallStatus = statusFor(t.overallCoveragePercent);

  return (
    <div>
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${overallStatus.cls}`}>
                {overallStatus.label}
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-medium">
                Scope-only coverage
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Platform coverage by framework</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Which parts of each framework are reachable through Google Workspace &amp; Microsoft 365
              permissions alone — and which parts stay out of scope.
            </p>
          </div>
          <div className="flex gap-3">
            <StatCard label="Frameworks" value={String(t.frameworks)} accent="text-white" />
            <StatCard label="Total controls" value={String(t.totalControls)} accent="text-white" />
            <StatCard label="Covered by scopes" value={String(t.controlsWithScope)} accent="text-emerald-300" />
            <StatCard label="Out of scope" value={String(t.controlsWithoutScope)} accent="text-rose-300" />
          </div>
        </div>
        <div className="mt-5 h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: animate ? `${t.overallCoveragePercent}%` : "0%",
              background: `linear-gradient(to right, ${overallStatus.ring}, ${overallStatus.ring}cc)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] text-slate-400">
          <span>{t.overallCoveragePercent}% of all controls covered</span>
          <span>{t.distinctScopes} permissions · {t.totalScopeMappings} scope mappings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.frameworks.map((fw) => {
          const st = statusFor(fw.coveragePercent);
          const catColors = fw.categories.map((_, ci) => CATEGORY_COLORS[ci % CATEGORY_COLORS.length]);
          const isOpen = !!expanded[fw.frameworkId];
          return (
            <div
              key={fw.frameworkId}
              className={`group bg-white rounded-xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                isOpen ? "border-indigo-300 shadow-lg" : "border-slate-200"
              }`}
            >
              <button
                onClick={() => setExpanded((p) => ({ ...p, [fw.frameworkId]: !p[fw.frameworkId] }))}
                className="w-full text-left p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{fw.frameworkName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                      {(fw.version || fw.region) && (
                        <span className="text-[11px] text-slate-400">{fw.version} · {fw.region}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      <span className="font-semibold text-emerald-600">{fw.controlsWithScope}</span>/{fw.totalControls} controls in scope
                      <span className="mx-1.5 text-slate-300">·</span>
                      {fw.distinctScopes} permissions
                      <span className="mx-1.5 text-slate-300">·</span>
                      {fw.totalScopeMappings} mappings
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: animate ? `${Math.max(2, fw.coveragePercent)}%` : "0%",
                          background: `linear-gradient(to right, ${st.ring}, ${st.ring}99)`,
                        }}
                      />
                    </div>
                  </div>
                  <Donut pct={fw.coveragePercent} size={92} stroke={9} />
                </div>
              </button>

              <div className={`grid transition-all duration-300 overflow-hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-5 pb-5 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">
                      Coverage by scope category
                    </div>
                    {fw.categories.length === 0 ? (
                      <div className="text-xs text-slate-400">No scope categories map to this framework.</div>
                    ) : (
                      <div className="space-y-2">
                        {fw.categories.map((c, ci) => (
                          <div key={c.category} className="flex items-center gap-3">
                            <div className="w-40 shrink-0 text-[11px] text-slate-600 truncate">{c.category}</div>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${catColors[ci]} transition-all duration-1000 ease-out`}
                                style={{ width: animate ? `${Math.max(2, c.sharePercent)}%` : "0%" }}
                              />
                            </div>
                            <div className="w-20 shrink-0 text-right text-[11px] text-slate-500">
                              {c.sharePercent}% · {c.coveredControls} controls
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">
                      Top permissions driving this framework
                    </div>
                    {fw.topScopes.length === 0 ? (
                      <div className="text-xs text-slate-400">No permissions map to this framework.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {fw.topScopes.map((s) => (
                          <div key={s.scopeId} className="flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="min-w-0">
                              <code className="text-[11px] font-mono text-blue-700">{s.scopeId}</code>
                              <div className="text-[11px] text-slate-400 truncate">{s.displayName}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-semibold text-slate-700">{s.coveragePercent}%</span>
                              <span className="text-[10px] text-slate-400">{s.controlsCovered} controls</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["critical", "high", "medium", "low"] as const).map(
                      (r) =>
                        fw.riskDistribution[r] > 0 && (
                          <span key={r} className={`text-[10px] px-2 py-1 rounded-full font-medium ${RISK_BADGE[r]}`}>
                            {r}: {fw.riskDistribution[r]}
                          </span>
                        ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl border border-white/10 px-4 py-3 text-center min-w-[110px]">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[10px] text-slate-300 mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}