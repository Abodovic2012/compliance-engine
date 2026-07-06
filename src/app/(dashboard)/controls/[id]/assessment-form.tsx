"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateControlStatus } from "@/server/actions/assessment";

const statuses = [
  { value: "compliant", label: "Compliant", color: "text-green-600" },
  { value: "partial", label: "Partially Compliant", color: "text-amber-600" },
  { value: "non_compliant", label: "Non-Compliant", color: "text-red-600" },
  { value: "not_assessed", label: "Not Assessed", color: "text-gray-500" },
] as const;

export function AssessmentForm({
  controlId,
  memberId,
  currentStatus,
}: {
  controlId: string;
  memberId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await updateControlStatus({
        controlId,
        memberId,
        status: form.get("status") as string,
        notes: form.get("notes") as string,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Assessment updated");
      router.refresh();
    } catch {
      toast.error("Failed to update assessment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Update Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <label
                  key={s.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5 ${
                    currentStatus === s.value ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.value}
                    defaultChecked={currentStatus === s.value}
                    className="sr-only"
                  />
                  <span className={s.color}>●</span>
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Add notes about evidence, gaps, or remediation..."
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Assessment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
