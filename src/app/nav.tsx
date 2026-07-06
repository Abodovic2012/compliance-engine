"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/data-items", label: "Data Items", icon: "database" },
  { href: "/frameworks", label: "Frameworks", icon: "book" },
  { href: "/mappings", label: "Mappings", icon: "link" },
  { href: "/evaluate", label: "Evaluate", icon: "check" },
  { href: "/reports", label: "Reports", icon: "chart" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col">
      <div className="p-5 border-b border-slate-700 flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded" />
        <div>
          <h1 className="text-white font-bold text-lg">Compliance Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">12 Frameworks · 134 Data Items</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-slate-700 text-white font-medium" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon name={l.icon} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 space-y-1">
        <div>v1.0.0 · SQLite</div>
        <div>&copy; MSc. Eng. Abdul Rahman Hawa</div>
      </div>
    </aside>
  );
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    grid: "▦", database: "🗄", book: "📖", link: "🔗", check: "✓", chart: "📊",
  };
  return <span className="w-5 text-center">{icons[name] || "○"}</span>;
}
