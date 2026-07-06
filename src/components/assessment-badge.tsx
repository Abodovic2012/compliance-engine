import { Badge } from "@/components/ui/badge";
import type { ControlStatus } from "@/types";

const variants: Record<ControlStatus, "compliant" | "non_compliant" | "partial" | "not_assessed"> = {
  compliant: "compliant",
  non_compliant: "non_compliant",
  partial: "partial",
  not_assessed: "not_assessed",
};

export function AssessmentBadge({ status }: { status: ControlStatus }) {
  return <Badge variant={variants[status]}>{status.replace("_", " ")}</Badge>;
}
