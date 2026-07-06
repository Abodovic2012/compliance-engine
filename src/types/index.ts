export type ControlStatus =
  | "compliant"
  | "non_compliant"
  | "not_assessed"
  | "partial";

export type AssessmentStatus = "draft" | "in_progress" | "completed";

export type MemberRole = "admin" | "member";

export type EvidenceType = "file" | "link" | "note";

export interface ControlWithDomain {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  domain: {
    code: string;
    name: string;
  };
  assessments: {
    status: ControlStatus;
    assessmentId: string;
  }[];
}
