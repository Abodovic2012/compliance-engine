"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addEvidence } from "@/server/actions/evidence";

export function EvidenceSection({
  assessmentId,
  controlId,
  memberId,
}: {
  assessmentId?: string;
  controlId: string;
  memberId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("note");
  const [fileName, setFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  if (!assessmentId) {
    return <p className="text-sm text-muted-foreground">Save an assessment first to add evidence.</p>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    form.set("memberId", memberId);
    form.set("controlId", controlId);
    form.set("assessmentId", assessmentId ?? "");
    form.set("type", type);

    try {
      const result = await addEvidence(form);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Evidence added");
      formRef.current?.reset();
      setFileName("");
      router.refresh();
    } catch {
      toast.error("Failed to add evidence");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {["note", "link", "file"].map((t) => (
          <label
            key={t}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent has-[:checked]:border-primary ${type === t ? "border-primary bg-primary/5" : ""}`}
          >
            <input type="radio" name="_type" checked={type === t} onChange={() => setType(t)} className="sr-only" />
            {t === "note" ? "📝 Note" : t === "link" ? "🔗 Link" : "📎 File"}
          </label>
        ))}
      </div>

      {type === "file" ? (
        <Input
          type="file"
          name="file"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          className={fileName ? "border-primary" : ""}
        />
      ) : (
        <Input
          name="value"
          placeholder={type === "link" ? "https://..." : "Write a note..."}
          required
        />
      )}

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Adding..." : "Add Evidence"}
      </Button>
    </form>
  );
}
