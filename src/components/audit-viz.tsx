"use client";

export interface Rule {
  label?: string;
  value: number;
  color: string;
}

export function Donut({ value, size = 120, track = "#e2e8f0", ring = "url(#grad)" }: { value: number; size?: number; track?: string; ring?: string }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut" data-testid="donut">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={10} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={value > 0 ? ring : track}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-slate-700 font-bold" style={{ fontSize: size / 5 }}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}

export function SegmentedDonut({ segments, size = 120 }: { segments: Rule[]; size?: number }) {
  const total = segments.reduce((s, r) => s + r.value, 0) || 1;
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const segmentsWithStart = segments.reduce<{ seg: Rule; start: number }[]>((acc, seg) => {
    const start = acc.length === 0 ? 0 : acc[acc.length - 1].start + acc[acc.length - 1].seg.value / total;
    acc.push({ seg, start });
    return acc;
  }, []);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} data-testid="seg-donut">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segmentsWithStart.map(({ seg, start }, i) => {
          const frac = seg.value / total;
          const dash = Math.max(frac * c - 2, 0);
          const off = c - start * c;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={off + 1}
            />
          );
        })}
      </g>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-slate-700 font-bold" style={{ fontSize: size / 5 }}>
        {total}
      </text>
    </svg>
  );
}

export function AnimatedBar({ value, color = "bg-blue-500", height = "h-2" }: { value: number; color?: string; height?: string }) {
  return (
    <div className={`${height} w-full bg-slate-100 rounded-full overflow-hidden`} data-testid="bar">
      <div
        className={`${height} rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}