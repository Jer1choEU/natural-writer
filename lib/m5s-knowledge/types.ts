export type M5SKnowledgeAuthority =
  | "foundational"
  | "ethical"
  | "member-approved-policy"
  | "organizational";

export type M5SKnowledgeSource = {
  id: string;
  title: string;
  authority: M5SKnowledgeAuthority;
  priority: number;
  effectiveDate?: string;
  url: string;
  note?: string;
};

export type M5SKnowledgeEntry = {
  id: string;
  type: "principle" | "policy" | "organization";
  title: string;
  summary: string;
  keywords: string[];
  sourceIds: string[];
  status: M5SKnowledgeAuthority;
  approvedAt?: string;
};
