import { Badge } from "@/components/ui/badge";
import type { ControlWithDomain } from "@/types";
import Link from "next/link";

export function ControlsTable({ controls }: { controls: ControlWithDomain[] }) {
  return (
    <div className="space-y-1">
      {controls.map((control) => {
        const status = control.assessments[0]?.status ?? "not_assessed";
        return (
          <Link
            key={control.id}
            href={`/controls/${control.id}`}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">{control.code}</span>
              <span>{control.name}</span>
            </div>
            <Badge variant={status as "compliant" | "non_compliant" | "partial" | "not_assessed"}>
              {status.replace("_", " ")}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
