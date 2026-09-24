import React, { useState } from "react";
import { VerdictPill } from "../components/ui/VerdictPill";
import { ModeBadge } from "../components/ui/ModeBadge";
import { StatusChip } from "../components/ui/StatusChip";
import { RuleLock } from "../components/ui/RuleLock";
import { SourceList } from "../components/ui/SourceList";
import { useToast } from "../context/ToastContext";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Clock,
  User,
  Video,
  Award,
  AlertCircle,
  HelpCircle,
  Radio,
} from "lucide-react";
import { useDispute } from "@/lib/hooks/useLineCall";

interface CaseFileViewProps {
  disputeId: string;
  onNavigate: (route: string) => void;
}

const EXPLORER =
  import.meta.env.VITE_GL_EXPLORER ||
  "https://explorer-studio-next.genlayer.com";
const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const CaseFileView: React.FC<CaseFileViewProps> = ({
  disputeId,
  onNavigate,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const { showToast } = useToast();
  const { data: dispute, isPending, isError } = useDispute(disputeId);

  const copyDisputeId = () => {
    if (!dispute?.dispute_id) return;
    navigator.clipboard.writeText(dispute.dispute_id);
    setCopiedId(true);
    showToast("info", "ID Copied", dispute.dispute_id);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isPending) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center font-mono text-xs text-[#9CA3AF]">
        <div className="w-8 h-8 border-2 border-[#0052FF]/20 border-t-[#C8F542] rounded-full animate-spin mx-auto mb-3" />
        Synchronizing VAR tablet feed {disputeId}...
      </div>
    );
  }

  if (isError || !dispute || dispute.found === false) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-[#E11D48]/10 border border-[#E11D48]/30 flex items-center justify-center mx-auto text-[#E11D48]">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono">
          No docket with that ID.
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          The requested dispute ID does not exist on the contract.
        </p>
        <button
          onClick={() => onNavigate("/disputes")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0052FF] text-white text-xs font-mono font-bold uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Board
        </button>
      </div>
    );
  }

  const id = dispute.dispute_id;
  const status = String(dispute.status || "").toLowerCase();
  const mode = String(dispute.mode || "").toLowerCase();
  const isOpen = status === "open";
  const isSettled = ["resolved", "appealed", "void"].includes(status);
  const creatorTruncated = dispute.creator
    ? `${dispute.creator.slice(0, 8)}...${dispute.creator.slice(-6)}`
    : "—";
  const resolvedDate = dispute.resolved_at
    ? new Date(dispute.resolved_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1E242E]">
        <button
          onClick={() => onNavigate("/disputes")}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9CA3AF] hover:text-[#C8F542]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          RETURN TO CHALLENGE LOG
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyDisputeId}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D121B] border border-[#1E242E] text-xs font-mono text-white"
          >
            {copiedId ? (
              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />
            )}
            <span>{id}</span>
          </button>

          <button
            onClick={() => onNavigate(`/disputes/${id}/record`)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D121B] border border-[#1E242E] text-xs font-mono text-[#C8F542]"
          >
            <Award className="w-3.5 h-3.5" />
            RECORD CERTIFICATE
          </button>

          {CONTRACT ? (
            <a
              href={`${EXPLORER}/address/${CONTRACT}`}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D121B] border border-[#1E242E] text-xs font-mono text-[#9CA3AF] hover:text-white"
            >
              GENLAYER EXPLORER
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-lg border border-[#1E242E] bg-[#0A0D13] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#C8F542]" />
                <span className="text-base font-extrabold text-white tracking-wider">
                  {id}
                </span>
                <span className="text-white/30">|</span>
                <span className="text-[#C8F542] font-bold uppercase">
                  {dispute.league}
                </span>
                <span className="text-white/30">·</span>
                <span className="text-[#9CA3AF]">{dispute.sport}</span>
              </div>
              <div className="flex items-center gap-2">
                <ModeBadge mode={mode} />
                <StatusChip status={status} />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {dispute.event_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#9CA3AF] pt-2 border-t border-[#1E242E]">
              <span className="flex items-center gap-1.5 text-white font-bold bg-[#131923] px-2 py-0.5 rounded border border-[#222A38]">
                <Clock className="w-3.5 h-3.5 text-[#C8F542]" />
                MARKER: {dispute.play_timestamp}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Challenger:{" "}
                <span className="text-white">{creatorTruncated}</span>
              </span>
            </div>
          </div>

          <div className="p-5 rounded-lg border-2 border-[#1E242E] bg-[#0A0D13]">
            <div className="flex items-center justify-between mb-2 font-mono text-[10px] tracking-widest text-[#C8F542] uppercase font-bold">
              <span>DISPUTED PROPOSITION</span>
              <span>YES / NO</span>
            </div>
            <blockquote className="text-base sm:text-lg text-white font-medium leading-relaxed italic">
              “{dispute.claim}”
            </blockquote>
          </div>

          <RuleLock ruleText={dispute.rule_text} ruleHash={dispute.rule_text} />

          <SourceList
            evidenceUrl={dispute.evidence_url}
            fallbackUrl={dispute.evidence_url_fallback}
            statsUrl={dispute.stats_url}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-lg border-2 border-[#242E3D] bg-[#0A0D14] overflow-hidden">
            <div className="bg-[#121824] px-4 py-2 border-b border-[#1E242E] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOpen ? "bg-[#E11D48] animate-pulse" : "bg-[#22C55E]"
                  }`}
                />
                <span className="font-extrabold text-white tracking-wider uppercase">
                  VAR BENCH
                </span>
              </div>
              <span className="text-[10px] text-[#C8F542] font-bold uppercase">
                MONITOR #01
              </span>
            </div>

            <div className="p-6 space-y-6">
              {isOpen && (
                <div className="space-y-5 text-center py-4">
                  <div className="p-4 rounded border border-[#E11D48]/40 bg-[#1A0A0E] space-y-2 text-left">
                    <div className="flex items-center gap-2 font-mono text-xs text-[#E11D48] font-bold">
                      <Radio className="w-4 h-4 animate-pulse" />
                      STATUS: AWAITING RESOLUTION
                    </div>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      Rule is locked. Anyone can trigger the committee to fetch
                      the public pages and write YES, NO, or VOID.
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(`/disputes/${id}/resolve`)}
                    className="w-full py-3.5 px-4 rounded bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Cpu className="w-4 h-4 text-[#C8F542]" />
                    RUN GENLAYER RESOLUTION
                  </button>
                </div>
              )}

              {isSettled && (
                <div className="space-y-6">
                  <VerdictPill verdict={dispute.verdict} size="giant" />

                  <div className="p-4 rounded border border-[#1E242E] bg-[#07090E] space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8F542] block font-bold">
                      REASONING
                    </span>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      {dispute.reasoning || "—"}
                    </p>
                  </div>

                  {mode === "data" && dispute.observed_value ? (
                    <div className="flex items-center justify-between p-3 rounded bg-[#07090E] border border-[#1E242E] text-xs font-mono">
                      <span className="text-[#9CA3AF] uppercase text-[10px]">
                        Observed
                      </span>
                      <span className="text-[#C8F542] font-black text-sm">
                        {dispute.observed_value}
                      </span>
                    </div>
                  ) : null}

                  <div className="space-y-2 text-xs font-mono border-t border-[#1E242E] pt-4">
                    <div className="flex justify-between text-[#9CA3AF] text-[11px]">
                      <span>RESOLVED AT</span>
                      <span className="text-white">{resolvedDate || "—"}</span>
                    </div>
                    <div className="flex justify-between text-[#9CA3AF] text-[11px]">
                      <span>APPEAL ALLOWANCE</span>
                      <span
                        className={
                          dispute.appeal_used
                            ? "text-[#A78BFA] font-bold"
                            : "text-white"
                        }
                      >
                        {dispute.appeal_used ? "1/1 CONSUMED" : "1 AVAILABLE"}
                      </span>
                    </div>
                  </div>

                  {!dispute.appeal_used && status === "resolved" && (
                    <div className="pt-2 border-t border-[#1E242E] space-y-2">
                      <button
                        onClick={() => onNavigate(`/disputes/${id}/appeal`)}
                        className="w-full py-2.5 px-4 rounded border-2 border-white/40 hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-2"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        FILE SINGLE APPEAL
                      </button>
                    </div>
                  )}

                  {dispute.appeal_used && (
                    <div className="p-3 rounded bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-[11px] font-mono text-[#A78BFA] flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      This call used its one appeal. Ruling is permanent.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded border border-[#1E242E] bg-[#0A0D13] text-[10px] font-mono text-[#9CA3AF] text-center">
            Recorded by GenLayer consensus. Not an official league ruling.
          </div>
        </div>
      </div>
    </div>
  );
};