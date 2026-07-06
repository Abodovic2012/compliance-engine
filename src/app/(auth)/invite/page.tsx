"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { acceptInvite } from "@/server/actions/invite";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleAccept() {
    setLoading(true);
    const session = await fetch("/api/auth/get-session").then(r => r.json());
    if (!session?.user) {
      toast.error("Please sign in first");
      router.push(`/login?redirect=/invite?token=${token}`);
      return;
    }
    const res = await acceptInvite({ token, userId: session.user.id });
    if (res.error) { toast.error(res.error); } else {
      toast.success("You've joined the organization!");
      setDone(true);
    }
    setLoading(false);
  }

  if (!token) return <p className="text-sm text-muted-foreground">No invite token provided.</p>;
  if (done) return <p className="text-sm text-muted-foreground">Invite accepted! <Link href="/dashboard" className="text-primary underline">Go to dashboard</Link></p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">You've been invited to join an organization on ComplyFlow.</p>
      <Button onClick={handleAccept} disabled={loading} className="w-full">{loading ? "Joining..." : "Accept Invite"}</Button>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Card>
      <CardHeader><CardTitle>Organization Invite</CardTitle></CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
          <InviteContent />
        </Suspense>
      </CardContent>
    </Card>
  );
}
