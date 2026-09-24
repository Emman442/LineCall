export type DisputeMode = "data" | "call";
export type DisputeStatus = "open" | "resolved" | "appealed" | "void";
export type DisputeVerdict = "" | "YES" | "NO" | "VOID";

export interface Dispute {
  dispute_id: string;
  found?: boolean;
  creator: string;
  sport: string;
  league: string;
  event_name: string;
  play_timestamp: string;
  claim: string;
  rule_text: string;
  mode: DisputeMode | string;
  evidence_url: string;
  evidence_url_fallback: string;
  stats_url: string;
  json_field_path: string;
  comparison: string;
  target_value: string;
  status: DisputeStatus | string;
  verdict: DisputeVerdict | string;
  reasoning: string;
  observed_value: string;
  created_at: string;
  resolved_at: string;
  appeal_used: boolean;
  appeal_context: string;
  admin?: string;
}

export interface CreateDisputeInput {
  sport: string;
  league: string;
  event_name: string;
  play_timestamp: string;
  claim: string;
  rule_text: string;
  mode: DisputeMode;
  evidence_url: string;
  evidence_url_fallback?: string;
  stats_url?: string;
  json_field_path?: string;
  comparison?: string;
  target_value?: string;
}

export interface TransactionReceipt {
  status?: string;
  status_name?: string;
  hash?: string;
  [key: string]: any;
}

export interface DisputeFilters {
  status?: DisputeStatus | "all";
  mode?: DisputeMode | "all";
  sport?: string;
  verdict?: DisputeVerdict | "all";
}