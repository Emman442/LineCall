import React, { useEffect, useState } from 'react';
import { VerdictPill } from '../components/ui/VerdictPill';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Video,
} from 'lucide-react';
import { Dispute } from '@/lib/contracts/types';
import { useDispute } from '@/lib/hooks/useLineCall';

interface VerdictRecordViewProps {
  disputeId: string;
  onNavigate: (route: string) => void;
}

export const VerdictRecordView: React.FC<VerdictRecordViewProps> = ({
  disputeId,
  onNavigate,
}) => {
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const { showToast } = useToast();

  const {isPending: loading, data: dispute} = useDispute(disputeId)


  const handlePrint = () => {
    window.print();
  };

  const copyReceiptJson = () => {
    if (dispute) {
      const receipt = {
        protocol: 'LineCall',
        docket_id: dispute.dispute_id,
        sport: dispute.sport,
        league: dispute.league,
        event: dispute.event_name,
        claim: dispute.claim,
        verdict: dispute.verdict,
        rule_hash: dispute.rule_text,
        contract: import.meta.env.VITE_CONTRACT_ADDRESS,
        tx_hash: "",
        resolved_at: dispute.resolved_at,
        evidence_url: dispute.evidence_url,
      };
      navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
      setCopiedReceipt(true);
      showToast('info', 'Receipt Copied', 'Cryptographic certificate payload copied to clipboard.');
      setTimeout(() => setCopiedReceipt(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center font-mono text-xs text-[#9CA3AF]">
        Loading certificate docket...
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-lg font-bold text-white font-mono">No docket with that ID.</h2>
        <button
          onClick={() => onNavigate('/disputes')}
          className="px-4 py-2 rounded bg-[#0052FF] text-white text-xs font-mono font-bold"
        >
          RETURN TO BOARD
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top action controls (Hidden in print) */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => onNavigate(`/disputes/${dispute.dispute_id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9CA3AF] hover:text-[#C8F542] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO VAR TABLET</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyReceiptJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1E242E] bg-[#0A0D13] hover:border-[#C8F542] text-xs font-mono text-white transition-colors cursor-pointer"
          >
            {copiedReceipt ? (
              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />
            )}
            <span>RECEIPT JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#0052FF] hover:bg-[#0047E0] text-xs font-mono font-bold uppercase text-white transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT CERTIFICATE</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Canvas */}
      <div className="relative rounded-lg border-2 border-[#242E3D] bg-[#0A0D13] p-8 sm:p-12 shadow-2xl space-y-8 overflow-hidden print:border-black print:bg-white print:text-black">
        {/* Decorative corner yard-markers */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C8F542]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C8F542]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C8F542]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C8F542]" />

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E242E] print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-[#C8F542] rounded-sm" />
              <span className="text-2xl font-black tracking-tight text-white font-sans print:text-black">
                LineCall
              </span>
              <span className="font-mono text-xs px-1 py-0.5 rounded bg-[#C8F542]/20 text-[#C8F542] border border-[#C8F542]/40 font-bold">
                VAR
              </span>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF] print:text-gray-600">
              Decentralized Autonomous Sports Arbitration Record
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-[#9CA3AF] block print:text-gray-500 text-[10px] uppercase">
              DOCKET RECORD NUMBER
            </span>
            <span className="text-xl font-extrabold text-[#C8F542] tracking-wider print:text-black">
              {dispute.dispute_id}
            </span>
          </div>
        </div>

        {/* Disputed Claim */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8F542] font-bold block">
            DISPUTED PROPOSITION
          </span>
          <blockquote className="text-base sm:text-lg text-white font-medium leading-relaxed italic print:text-black">
            &ldquo;{dispute.claim}&rdquo;
          </blockquote>
          <div className="flex items-center gap-3 text-xs font-mono text-[#9CA3AF] pt-1">
            <span className="text-white font-bold">{dispute.sport}</span>
            <span>·</span>
            <span className="text-[#C8F542]">{dispute.league}</span>
            <span>·</span>
            <span>{dispute.event_name}</span>
            <span>·</span>
            <span>{dispute.play_timestamp}</span>
          </div>
        </div>

        {/* On-Screen Ruling Display */}
        <div className="p-6 rounded border border-[#1E242E] bg-[#07090E] flex flex-col sm:flex-row items-center justify-between gap-6 print:border-gray-300 print:bg-gray-50">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF] block mb-1">
              OFFICIAL ARBITRATION RULING
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white print:text-black">
                {dispute.verdict || 'AWAITING'}
              </span>
              {dispute.verdict && (
                <VerdictPill verdict={dispute.verdict} size="md" showSubtitle={true} />
              )}
            </div>
          </div>

          <div className="text-right font-mono text-xs text-[#9CA3AF] space-y-1 sm:border-l border-[#1E242E] sm:pl-6 print:border-gray-300">
            <div>
              <span className="text-[#9CA3AF]">Status: </span>
              <span className="text-white font-semibold print:text-black">{dispute.status}</span>
            </div>
            {/* <div>
              <span className="text-[#9CA3AF]">Quorum: </span>
              <span className="text-[#22C55E] font-semibold">{dispute.q || 'Consensus'}</span>
            </div> */}
            <div>
              <span className="text-[#9CA3AF]">Appellate: </span>
              <span className="text-white print:text-black">
                {dispute.appeal_used ? 'Re-examined' : 'Original Ruling'}
              </span>
            </div>
          </div>
        </div>

        {/* Rule Excerpt */}
        <div className="space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase text-[#9CA3AF] font-bold text-[10px]">
              RULE INVARIANT STANDARD EXCERPT
            </span>
            <span className="text-[10px] text-[#C8F542]">
              SHA-256: {dispute.rule_text.slice(0, 16)}...
            </span>
          </div>
          <div className="p-4 rounded bg-[#07090E] border border-[#1E242E] text-xs text-[#D1D5DB] leading-relaxed print:bg-gray-50 print:text-black print:border-gray-300">
            {dispute.rule_text}
          </div>
        </div>

        {/* Sources Examined */}
        <div className="space-y-2 font-mono text-xs">
          <span className="uppercase text-[#9CA3AF] font-bold block text-[10px]">
            PUBLIC EVIDENCE FEEDS EXAMINED
          </span>
          <div className="space-y-1.5">
            <div className="p-2.5 rounded bg-[#07090E] border border-[#1E242E] truncate text-[#0052FF] flex items-center justify-between print:bg-gray-50 print:border-gray-300">
              <span className="truncate">{dispute.evidence_url}</span>
              <span className="text-[10px] text-[#22C55E] ml-2 shrink-0 font-bold">PRIMARY TAPE</span>
            </div>
            {dispute.evidence_url_fallback && (
              <div className="p-2.5 rounded bg-[#07090E] border border-[#1E242E] truncate text-[#9CA3AF] flex items-center justify-between print:bg-gray-50 print:border-gray-300">
                <span className="truncate">{dispute.evidence_url_fallback}</span>
                <span className="text-[10px] text-[#9CA3AF] ml-2 shrink-0">FALLBACK</span>
              </div>
            )}
          </div>
        </div>

        {/* Official Disclaimed Footer */}
        <div className="pt-6 border-t border-[#1E242E] space-y-4 print:border-gray-300 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#9CA3AF]">
            <div>
              <span className="block text-[10px] uppercase">RESOLVED TIMESTAMP</span>
              <span className="text-white font-medium print:text-black">
                {dispute.resolved_at || 'Awaiting Consensus'}
              </span>
            </div>
            {/* <div>
              <span className="block text-[10px] uppercase">GENLAYER TRANSACTION</span>
              <span className="text-white font-medium truncate block print:text-black">
                {dispute.txHash}
              </span>
            </div> */}
          </div>

          <div className="p-3 rounded bg-[#07090E] border border-[#1E242E] text-center text-[#9CA3AF] text-[11px] leading-relaxed print:bg-gray-100 print:text-gray-700 print:border-gray-300">
            &ldquo;Recorded by GenLayer consensus. Not an official league ruling.&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
};
