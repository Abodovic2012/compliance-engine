"use client";

import { useState, useEffect, useCallback } from "react";
import { Donut, AnimatedBar } from "@/components/audit-viz";

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

interface WeakPoint {
  frameworkId: string;
  frameworkName: string;
  controlId: string;
  ref: string;
  theme: string;
  status: string;
  evidenceMissing: boolean;
}

interface Report {
  generatedAt: string;
  totalControls: number;
  assessedControls: number;
  overall: number;
  frameworks: FrameworkScore[];
  weakPoints: WeakPoint[];
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

const STATUS_LABEL: Record<string, string> = {
  compliant: "Compliant",
  partial: "Partial",
  noncompliant: "Non-compliant",
  notstarted: "Not assessed",
};

function statusFor(pct: number): string {
  if (pct >= 90) return "compliant";
  if (pct >= 70) return "partially-compliant";
  if (pct >= 40) return "at-risk";
  return "non-compliant";
}

export default function AssessmentPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFw, setExpandedFw] = useState<Record<string, boolean>>({});

  const load = useCallback(() => {
    fetch("/api/audit/report")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReport(data.scorecard);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assessment report");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFw = (id: string) =>
    setExpandedFw((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!report) return <div className="text-slate-400 text-sm">No data</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Compliance Scorecard</h1>
      <p className="text-sm text-slate-500 mb-6">
        Audit-based compliance score across all frameworks. Each control is weighted by audit status:
        compliant counts fully, partial counts half, missing evidence lowers the score.
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 grid gap-6 md:grid-cols-[auto_1fr] items-center">
        <div className="flex items-center gap-6">
          <Donut value={report.overall} size={150} />
          <div className="min-w-[140px]">
            <div className="text-sm font-medium text-slate-600">Overall</div>
            <div className="text-4xl font-extrabold text-slate-800">{report.overall}%</div>
            <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[statusFor(report.overall)] ?? ""}`}>
              {statusFor(report.overall)}
            </span>
          </div>
        </div>
        <div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${BAR_STYLE[statusFor(report.overall)]}`}
              style={{ width: `${report.overall}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>{report.frameworks.length} frameworks in scope</span>
            <span>
              {report.assessedControls} / {report.totalControls} controls assessed
            </span>
          </div>
        </div>
      </div>

      {report.weakPoints.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-3">
            Weak points ({report.weakPoints.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {report.weakPoints.slice(0, 14).map((w, i) => (
              <div key={i} className="py-2 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm text-slate-700">
                    <span className="font-mono text-xs text-blue-700">{w.ref}</span>
                    <span className="font-medium"> {w.theme}</span>
                    <span className="text-slate-400"> · {w.frameworkName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[statusFor(pctOfStatus(w.status))] ?? ""}`}>
                    {STATUS_LABEL[w.status] ?? w.status}
                  </span>
                  {w.evidenceMissing && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                      no evidence
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Frameworks</h2>
      <div className="space-y-4">
        {report.frameworks.map((fw) => {
          return (
            <div key={fw.frameworkId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFw(fw.frameworkId)}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 flex flex-wrap items-center gap-6"
              >
                <SegmentedMini value={fw.percentage} />
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{fw.frameworkName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[fw.status] ?? ""}`}>
                      {fw.status}
                    </span>
                    {(fw.version || fw.region) && (
                      <span className="text-xs text-slate-400">{fw.version} · {fw.region}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {fw.totalControls} controls · {fw.assessedControls} assessed · {fw.compliant} compliant
                    {fw.partial > 0 ? ` · ${fw.partial} partial` : ""}
                    {fw.noncompliant > 0 ? ` · ${fw.noncompliant} non-compliant` : ""}
                    {fw.notstarted > 0 ? ` · ${fw.notstarted} not assessed` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-48">
                  <AnimatedBar value={fw.percentage} color={BAR_STYLE[fw.status]} />
                  <span className="text-sm font-semibold text-slate-700 w-10 text-right">{fw.percentage}%</span>
                </div>
                <span className="text-slate-300">{expandedFw[fw.frameworkId] ? "−" : "+"}</span>
              </button>

              {expandedFw[fw.frameworkId] && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 grid gap-3 md:grid-cols-4">
                  <ScoreTile label="Compliant" value={fw.compliant} color="text-emerald-600" />
                  <ScoreTile label="Partial" value={fw.partial} color="text-amber-600" />
                  <ScoreTile label="Non-compliant" value={fw.noncompliant} color="text-red-600" />
                  <ScoreTile label="Not assessed" value={fw.notstarted} color="text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SegmentedMini({ value }: { value: number }) {
  return <Donut value={value} size={72} />;
}

function ScoreTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function pctOfStatus(status: string): number {
  if (status === "compliant") return 95;
  if (status === "partial") return 75;
  if (status === "noncompliant") return 39;
  return 39;
}