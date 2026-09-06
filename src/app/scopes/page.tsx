"use client";

import { useState, useEffect } from "react";

interface ScopeControl {
  ref: string;
  theme: string;
  frameworkId: string;
  framework: { name: string };
}

interface ScopeMapping {
  id: string;
  justification: string;
  riskLevel: string;
  control: ScopeControl;
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
  _count: { mappings: number };
  mappings: ScopeMapping[];
}

interface CategoryAgg {
  category: string;
  _count: { category: number };
}

export default function ScopesPage() {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [categories, setCategories] = useState<CategoryAgg[]>([]);
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
    const params = new URLSearchParams();
    if (provider) params.set("provider", provider);
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    load(params);
  }, [provider, category, q]);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const grouped = [...new Set(scopes.map((s) => s.provider))];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">OAuth Scopes</h1>
      <p className="text-sm text-slate-500 mb-6">
        Google Workspace &amp; Microsoft 365 / Graph permissions, mapped to framework controls.
      </p>

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
                  {providerScopes.map((s) => (
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
                          <div className="text-xs text-slate-400 mt-0.5">{s.category}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-400">
                            {s._count.mappings} controls
                          </span>
                          <span className="text-slate-300">{expanded[s.id] ? "−" : "+"}</span>
                        </div>
                      </button>
                      {expanded[s.id] && (
                        <div className="px-4 pb-4 pt-1 bg-slate-50/50">
                          <p className="text-xs text-slate-500 mb-3">{s.description}</p>
                          {s.mappings.length === 0 ? (
                            <div className="text-xs text-slate-400">No control mappings.</div>
                          ) : (
                            <div className="text-xs">
                              <div className="font-medium text-slate-700 mb-2">Mapped controls by framework:</div>
                              {Object.entries(
                                s.mappings.reduce<Record<string, ScopeMapping[]>>((acc, m) => {
                                  const fw = m.control.framework.name;
                                  (acc[fw] = acc[fw] || []).push(m);
                                  return acc;
                                }, {})
                              ).map(([fw, ms]) => (
                                <div key={fw} className="mb-2">
                                  <div className="text-slate-500 font-medium mb-1">{fw}</div>
                                  <div className="flex flex-wrap gap-2">
                                    {ms.map((m) => (
                                      <span
                                        key={m.id}
                                        title={`${m.justification}${m.riskLevel ? " (risk: " + m.riskLevel + ")" : ""}`}
                                        className="inline-block px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700"
                                      >
                                        {m.control.ref} · {m.control.theme}
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
