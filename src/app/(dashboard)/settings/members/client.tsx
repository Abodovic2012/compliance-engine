"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createInvite, getPendingInvites } from "@/server/actions/invite";

export function MembersClient({ member }: { member: any }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<any[]>(member.organization.inviteTokens ?? []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await createInvite({ email, memberId: member.id });
    if (res.error) { toast.error(res.error); } else {
      toast.success(`Invite sent! Check console for link (dev mode)`);
      if (res.inviteUrl) console.log(`[DEV] Invite link: ${res.inviteUrl}`);
      setEmail("");
      const updated = await getPendingInvites(member.id);
      setPending(updated);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="text-sm text-muted-foreground">Manage your organization members</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Current Members ({member.organization.members.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {member.organization.members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                <div>
                  <p className="font-medium">{m.user.name ?? m.user.email}</p>
                  <p className="text-sm text-muted-foreground">{m.user.email}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {member.role === "admin" && (
        <>
          <Card>
            <CardHeader><CardTitle>Invite Member</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Invite"}</Button>
              </form>
            </CardContent>
          </Card>

          {pending.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Pending Invites ({pending.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pending.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                      <div>
                        <p className="font-medium">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
