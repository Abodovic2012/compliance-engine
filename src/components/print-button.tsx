"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 print:hidden">
      Print / Save PDF
    </button>
  );
}
