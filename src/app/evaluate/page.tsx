"use client";

import { useState, useEffect } from "react";

export default function EvaluatePage() {
  const [items, setItems] = useState<{ id: string; key: string; label: string; domain: string }[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [value, setValue] = useState("");
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/data-items")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, []);

  async function evaluate() {
    if (!selectedId || !value) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataItemId: selectedId, actualValue: value }),
      });
      if (!res.ok) {
        setError((await res.json()).error || "Evaluation failed");
        return;
      }
      setResults(await res.json());
    } catch {
      setError("Failed to evaluate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Evaluate Compliance</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Item</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select a data item...</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>{i.label} ({i.key})</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Actual Value</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 45, true, enabled, 100"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={evaluate}
            disabled={loading || !selectedId || !value}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Evaluating..." : "Evaluate"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {results && (
        <div>
          <h2 className="font-semibold mb-3">
            Results for: {(results as { dataItem: { label: string } }).dataItem?.label}
          </h2>
          <div className="space-y-3">
            {(results as { results: Record<string, unknown>[] }).results?.map((r: Record<string, unknown>, i: number) => (
              <div key={i} className={`bg-white rounded-xl border p-5 ${r.compliant ? "border-green-200" : "border-red-200"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{r.framework as string}</span>
                    <span className="text-slate-400 mx-2">/</span>
                    <span className="font-mono text-sm">{r.controlRef as string}</span>
                    <span className="text-slate-500 text-sm ml-2">{r.controlTheme as string}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge badge-${(r.severity as string).toLowerCase()}`}>{r.severity as string}</span>
                    <span className={`text-xs font-medium ${r.compliant ? "text-green-600" : "text-red-600"}`}>
                      {r.compliant ? "COMPLIANT" : "NON-COMPLIANT"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-2">Value: {String(r.actualValue)} | SLA: {r.slaThreshold as string}</p>
                <p className="text-sm text-slate-600 mb-2">{r.remediation as string}</p>
                <p className="text-xs text-slate-400">Evidence: {r.evidenceRequired as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
