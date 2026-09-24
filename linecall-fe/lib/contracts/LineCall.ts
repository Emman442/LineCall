import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type {
  CreateDisputeInput,
  Dispute,
  TransactionReceipt,
} from "./types";
import {
  estimateWriteFeePreset,
  feePresetToTransactionFees,
  type FeePresetEstimate,
  type FeePresetLevel,
} from "../genlayer/fees";

function normalizeDispute(raw: any, fallbackId = ""): Dispute {
  const row = raw && typeof raw === "object" ? raw : {};
  return {
    dispute_id: String(row.dispute_id ?? fallbackId),
    found: row.found !== false,
    creator: String(row.creator ?? ""),
    sport: String(row.sport ?? ""),
    league: String(row.league ?? ""),
    event_name: String(row.event_name ?? ""),
    play_timestamp: String(row.play_timestamp ?? ""),
    claim: String(row.claim ?? ""),
    rule_text: String(row.rule_text ?? ""),
    mode: String(row.mode ?? "call"),
    evidence_url: String(row.evidence_url ?? ""),
    evidence_url_fallback: String(row.evidence_url_fallback ?? ""),
    stats_url: String(row.stats_url ?? ""),
    json_field_path: String(row.json_field_path ?? ""),
    comparison: String(row.comparison ?? ""),
    target_value: String(row.target_value ?? ""),
    status: String(row.status ?? "open"),
    verdict: String(row.verdict ?? ""),
    reasoning: String(row.reasoning ?? ""),
    observed_value: String(row.observed_value ?? ""),
    created_at: String(row.created_at ?? ""),
    resolved_at: String(row.resolved_at ?? ""),
    appeal_used: Boolean(row.appeal_used),
    appeal_context: String(row.appeal_context ?? ""),
    admin: row.admin ? String(row.admin) : undefined,
  };
}

function asList(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (raw instanceof Map) return Array.from(raw.values());
  if (typeof raw === "object") return Object.values(raw);
  return [];
}

class LineCall {
  private contractAddress: `0x${string}`;
  private client: any;
  private studioUrl?: string;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;
    this.studioUrl = studioUrl;

    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    if (studioUrl) config.endpoint = studioUrl;
    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };
    if (this.studioUrl) config.endpoint = this.studioUrl;
    this.client = createClient(config);
  }

  private async wait(hash: string, retries = 24) {
    if (typeof this.client.waitForTransactionReceipt !== "function") {
      return { hash };
    }
    try {
      return await this.client.waitForTransactionReceipt({
        hash,
        waitUntil: "decided",
        retries,
        interval: 5000,
      });
    } catch {
      return await this.client.waitForTransactionReceipt({
        hash,
        status: "ACCEPTED",
        retries,
        interval: 5000,
      });
    }
  }

  async getDisputes(): Promise<Dispute[]> {
    const raw = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_all_disputes",
      args: [],
    });
    return asList(raw).map((row, i) =>
      normalizeDispute(row, `dispute_${i + 1}`)
    );
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    const raw = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_dispute",
      args: [disputeId],
    });
    const dispute = normalizeDispute(raw, disputeId);
    if (raw && raw.found === false) return null;
    return dispute;
  }

  async listDisputeIds(): Promise<string[]> {
    const raw = await this.client.readContract({
      address: this.contractAddress,
      functionName: "list_dispute_ids",
      args: [],
    });
    return asList(raw).map(String);
  }

  async getAdmin(): Promise<string> {
    const raw = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_admin",
      args: [],
    });
    return String(raw ?? "");
  }

  async getTotalDisputes(): Promise<number> {
    const raw = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_total_disputes",
      args: [],
    });
    return Number(raw) || 0;
  }

  async estimateCreateDisputeFees(
    input: CreateDisputeInput,
    level: FeePresetLevel = "standard"
  ): Promise<FeePresetEstimate | undefined> {
    return estimateWriteFeePreset(
      this.client,
      {
        address: this.contractAddress,
        functionName: "create_dispute",
        args: this.createArgs(input),
      },
      level
    );
  }

  async estimateResolveFees(
    disputeId: string,
    level: FeePresetLevel = "standard"
  ): Promise<FeePresetEstimate | undefined> {
    return estimateWriteFeePreset(
      this.client,
      {
        address: this.contractAddress,
        functionName: "resolve",
        args: [disputeId],
      },
      level
    );
  }

  async estimateAppealFees(
    disputeId: string,
    appealContext: string,
    level: FeePresetLevel = "standard"
  ): Promise<FeePresetEstimate | undefined> {
    return estimateWriteFeePreset(
      this.client,
      {
        address: this.contractAddress,
        functionName: "appeal",
        args: [disputeId, appealContext],
      },
      level
    );
  }

  async createDispute(
    input: CreateDisputeInput,
    feePreset?: FeePresetEstimate
  ): Promise<TransactionReceipt> {
    const fees = feePresetToTransactionFees(feePreset);
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "create_dispute",
      args: this.createArgs(input),
      value: BigInt(0),
      ...(fees ? { fees } : {}),
    });
    return (await this.wait(txHash, 24)) as TransactionReceipt;
  }

  async resolve(
    disputeId: string,
    feePreset?: FeePresetEstimate
  ): Promise<TransactionReceipt> {
    const fees = feePresetToTransactionFees(
      feePreset ?? (await this.estimateResolveFees(disputeId))
    );
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "resolve",
      args: [disputeId],
      value: BigInt(0),
      ...(fees ? { fees } : {}),
    });
    return (await this.wait(txHash, 48)) as TransactionReceipt;
  }

  async appeal(
    disputeId: string,
    appealContext: string,
    feePreset?: FeePresetEstimate
  ): Promise<TransactionReceipt> {
    const fees = feePresetToTransactionFees(
      feePreset ?? (await this.estimateAppealFees(disputeId, appealContext))
    );
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "appeal",
      args: [disputeId, appealContext],
      value: BigInt(0),
      ...(fees ? { fees } : {}),
    });
    return (await this.wait(txHash, 48)) as TransactionReceipt;
  }

  private createArgs(input: CreateDisputeInput) {
    return [
      input.sport,
      input.league,
      input.event_name,
      input.play_timestamp,
      input.claim,
      input.rule_text,
      input.mode,
      input.evidence_url,
      input.evidence_url_fallback ?? "",
      input.stats_url ?? "",
      input.json_field_path ?? "",
      input.comparison ?? "",
      input.target_value ?? "",
    ];
  }
}

export default LineCall;