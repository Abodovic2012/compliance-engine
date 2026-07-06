import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/frameworks/iso27001", label: "ISO 27001", icon: "◇" },
  { href: "/frameworks/soc2", label: "SOC 2", icon: "○" },
  { href: "/evidence", label: "Evidence", icon: "□" },
  { href: "/reports", label: "Reports", icon: "▤" },
  { href: "/settings/members", label: "Members", icon: "⊕" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar({ user }: { user: { name?: string | null; email: string } }) {
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <aside className="flex w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
        <span className="text-lg">◆</span>
        <span>ComplyFlow</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <Separator />
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-medium">{user.name ?? "User"}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}
