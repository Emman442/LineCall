import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Lock,
  Scale,
  Radio,
  Video,
} from 'lucide-react';
import { useDispute, useResolveDispute } from '@/lib/hooks/useLineCall';

interface ResolveConfirmViewProps {
  disputeId: string;
  onNavigate: (route: string) => void;
  onResolved: (id: string) => void;
}

export const ResolveConfirmView: React.FC<ResolveConfirmViewProps> = ({
  disputeId,
  onNavigate,
  onResolved,
}) => {
  const [resolveProgress, setResolveProgress] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

  const { showToast } = useToast();

  const {data: dispute, isPending: loadingDocket} = useDispute(disputeId)
  const {mutate: resolveDispute, isPending: isResolving} = useResolveDispute()

  const handleResolve = async () => {
    if (!dispute) return;

    resolveDispute(disputeId, {
      onSuccess: ()=>{
        showToast("success", "Dispute resolevd successfully!")
      },
      onError: ()=> {
        showToast("error", "Failed to resolve dispute")
      }
    })
  };

  if (loadingDocket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center font-mono text-xs text-[#9CA3AF]">
        Loading docket file...
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

  if (dispute.status.toLowerCase() !== 'open') {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-12 h-12 rounded bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center mx-auto text-[#22C55E]">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-white font-mono">Docket Already Settled</h2>
      <p className="text-xs text-[#9CA3AF]">
        This dispute docket has already been evaluated and its verdict is recorded on-chain.
      </p>
      <button
        onClick={() => onNavigate(`/disputes/${dispute.dispute_id}`)}
        className="px-4 py-2 rounded bg-[#0052FF] text-white text-xs font-mono font-bold uppercase cursor-pointer"
      >
        VIEW CASE FILE
      </button>
    </div>
  );
}

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back */}
      <button
        onClick={() => onNavigate(`/disputes/${dispute.dispute_id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9CA3AF] hover:text-[#C8F542] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO DOCKET {dispute.dispute_id}</span>
      </button>

      {/* Header */}
      <div className="p-5 rounded-lg border border-[#1E242E] bg-[#0A0D13]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#C8F542] uppercase font-bold">
          <Scale className="w-4 h-4 text-[#C8F542]" />
          <span>AUTONOMOUS REFEREE RESOLUTION</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1 font-sans">
          Confirm GenLayer Resolution
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Review pre-flight invariants before triggering validator nodes to fetch public tape and commit the consensus verdict.
        </p>
      </div>

      {/* Case Preview Card */}
      <div className="p-4 rounded-lg border border-[#1E242E] bg-[#0A0D13] space-y-2 text-xs font-mono">
        <div className="flex justify-between items-center text-[#9CA3AF] text-[11px] pb-2 border-b border-[#1E242E]">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-[#C8F542]" />
            {dispute.dispute_id}
          </span>
          <span className="text-[#C8F542] font-bold">{dispute.sport} · {dispute.league}</span>
        </div>
        <p className="text-white italic font-sans font-medium text-sm pt-1">
          &ldquo;{dispute.claim}&rdquo;
        </p>
        <div className="text-[11px] text-[#9CA3AF] truncate pt-1">
          Feed: <span className="text-[#0052FF]">{dispute.evidence_url}</span>
        </div>
      </div>

      {/* Pre-flight Checklist */}
      <div className="rounded-lg border border-[#1E242E] bg-[#0A0D13] p-6 space-y-4 font-mono">
        <h3 className="text-xs uppercase tracking-wider text-white font-bold">
          PRE-RESOLUTION VERIFICATION CHECKLIST
        </h3>

        <div className="space-y-3 text-xs">
          {/* Check 1 */}
          <div className="flex items-start gap-3 p-3 rounded bg-[#07090E] border border-[#1E242E]">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block">
                SOURCES PUBLIC & FETCHABLE
              </span>
              <span className="text-[#9CA3AF] text-[11px]">
                Endpoint responds with valid HTTP content accessible by external committee nodes without session cookies.
              </span>
            </div>
          </div>

          {/* Check 2 */}
          <div className="flex items-start gap-3 p-3 rounded bg-[#07090E] border border-[#1E242E]">
            <Lock className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block">
                RULE FROZEN & INVARIANT
              </span>
              <span className="text-[#9CA3AF] text-[11px]">
                Rule standard SHA-256 hash locked at docket creation. Retrospective modifications are mathematically barred.
              </span>
            </div>
          </div>

          {/* Check 3 */}
          <div className="flex items-start gap-3 p-3 rounded bg-[#07090E] border border-[#1E242E]">
            <Scale className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block">
                CLAIM IS AFFIRMATIVE PROPOSITION
              </span>
              <span className="text-[#9CA3AF] text-[11px]">
                The claim states a binary condition that will stand (YES), be overturned (NO), or resolve to VOID due to incomplete evidence.
              </span>
            </div>
          </div>
        </div>

        {/* Resolution In-Flight Animation */}
        {isResolving && (
          <div className="p-4 rounded bg-[#07090E] border border-[#0052FF] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#E11D48] animate-pulse" />
                COMMITTEE FETCHING SOURCES…
              </span>
              <span className="text-[#C8F542] font-bold">
                PHASE {activeStep + 1} OF 5
              </span>
            </div>
            {/* <p className="text-xs text-[#D1D5DB] font-mono leading-relaxed">
              {resolveProgress}
            </p> */}
            <div className="w-full h-1.5 bg-[#1E242E] rounded overflow-hidden">
              <div
                className="h-full bg-[#C8F542] transition-all duration-300"
                style={{ width: `${((activeStep + 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            disabled={isResolving}
            onClick={handleResolve}
            className="w-full py-3 px-4 rounded bg-[#0052FF] hover:bg-[#0047E0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono font-black tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,82,255,0.4)] flex items-center justify-center gap-2 cursor-pointer border border-[#0052FF]"
          >
            {isResolving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>RUNNING COMMITTEE CONSENSUS...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 text-[#C8F542]" />
                <span>RESOLVE ON GENLAYER</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-[#9CA3AF] text-center font-mono">
          Writes directly to the GenLayer contract address. Anyone can trigger this public step.
        </p>
      </div>
    </div>
  );
};
