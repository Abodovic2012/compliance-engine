import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export function Header({ user }: { user: { name?: string | null; email: string } }) {
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-6">
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href="/settings">Settings</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/api/auth/sign-out">Sign Out</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
