import React, { useEffect, useState } from 'react';
import { VerdictPill } from '../components/ui/VerdictPill';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Flag, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAppealDispute, useDispute } from '@/lib/hooks/useLineCall';

interface AppealViewProps {
  disputeId: string;
  onNavigate: (route: string) => void;
  onAppealed: (id: string) => void;
}

export const AppealView: React.FC<AppealViewProps> = ({
  disputeId,
  onNavigate,
  onAppealed,
}) => {
  // const [loadingDocket, setLoadingDocket] = useState(true);
  const [appealContext, setAppealContext] = useState('');

  const { mutate: submitAppeal, isPending: submitting } = useAppealDispute()

  const { showToast } = useToast();


  const { data: dispute, isPending: loadingDocket } = useDispute(disputeId)

  const handleSubmitAppeal = async () => {
    if (!dispute) return;

    if (dispute.appeal_used) {
      showToast('error', 'Appeal Denied', 'This call used its one appeal.');
      return;
    }

    if (appealContext.trim().length < 12) {
      showToast('error', 'Context Too Short', 'Please provide at least 12 characters of detailed reasoning.');
      return;
    }

    submitAppeal({ disputeId, appealContext }, {
      onSuccess: () => {
        showToast('success', 'Appeal Recorded', `Case ${dispute.dispute_id} appellate review submitted.`);
      },
      onError: (err) => {
        showToast('error', 'Appeal Failed', err?.message || 'Transaction reverted');
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

  if (dispute.appeal_used) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 font-mono">
        <div className="w-12 h-12 rounded bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center mx-auto text-[#F5A524]">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">ALREADY APPEALED</h2>
        <p className="text-xs text-[#9CA3AF]">
          This call used its one appeal. Under LineCall protocol governance, all dockets are entitled to exactly one challenge review. The current ruling is permanent.
        </p>
        <button
          onClick={() => onNavigate(`/disputes/${dispute.dispute_id}`)}
          className="px-4 py-2 rounded bg-[#0052FF] text-white text-xs font-bold uppercase cursor-pointer"
        >
          RETURN TO CASE FILE
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={() => onNavigate(`/disputes/${dispute.dispute_id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9CA3AF] hover:text-[#C8F542] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO DOCKET {dispute.dispute_id}</span>
      </button>

      <div className="p-5 rounded-lg border border-[#1E242E] bg-[#0A0D13]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#F5A524] uppercase font-bold">
          <Flag className="w-4 h-4 text-[#F5A524]" />
          <span>OFFICIAL CHALLENGE FLAG</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1 font-sans">
          File Single Appeal for Re-Review
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Submit additional context or point out misinterpretation of public telemetry. Each docket is granted strictly one challenge appeal.
        </p>
      </div>

      {/* Original Ruling Read-Only Card */}
      <div className="rounded-lg border border-[#1E242E] bg-[#0A0D13] p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E242E]">
          <span className="text-xs font-mono uppercase text-[#9CA3AF] font-bold">
            ORIGINAL RULING ON RECORD (READ-ONLY)
          </span>
          <VerdictPill verdict={dispute.verdict} size="sm" showSubtitle={true} />
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-mono text-[#9CA3AF] text-[10px] uppercase font-bold block">
              DISPUTED CLAIM
            </span>
            <p className="text-white italic mt-1 font-sans text-sm">&ldquo;{dispute.claim}&rdquo;</p>
          </div>

          <div>
            <span className="font-mono text-[#9CA3AF] text-[10px] uppercase font-bold block">
              COMMITTEE REASONING
            </span>
            <p className="text-[#D1D5DB] bg-[#07090E] p-3 rounded border border-[#1E242E] leading-relaxed mt-1 font-sans">
              {dispute.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Appeal Context Form */}
      <div className="rounded-lg border border-[#1E242E] bg-[#0A0D13] p-6 space-y-4 font-mono">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs uppercase text-white font-bold">
              WHY THE ORIGINAL CALL IS WRONG *
            </label>
            <span className="text-[11px] text-[#9CA3AF]">
              min 12 characters ({appealContext.length})
            </span>
          </div>
          <textarea
            rows={5}
            placeholder="Explain why the validator committee’s interpretation of the public tape or telemetry was flawed (e.g. 'The limb tracking timestamp used the shoulder frame instead of boot contact point...')"
            value={appealContext}
            onChange={(e) => setAppealContext(e.target.value)}
            className="w-full px-3 py-2.5 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs leading-relaxed focus:outline-none focus:border-[#F5A524] font-sans"
          />
        </div>

        {/* Warning banner */}
        <div className="p-3.5 rounded bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-start gap-2 text-xs text-[#F5A524]">
          <Flag className="w-4 h-4 shrink-0 mt-0.5 text-[#F5A524]" />
          <p className="leading-relaxed text-[11px]">
            <span className="font-bold">ONE APPEAL RESTRICTION:</span> Once submitted, this action permanently sets <code className="font-mono bg-[#F5A524]/20 px-1 rounded">appeal_used = true</code>. No subsequent challenges will be accepted for this docket.
          </p>
        </div>

        {/* Submit */}
        <button
          disabled={appealContext.trim().length < 12 || submitting}
          onClick={handleSubmitAppeal}
          className="w-full py-3 px-4 rounded bg-[#F5A524] hover:bg-[#E0921B] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-mono font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <span>SUBMITTING CHALLENGE...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>SUBMIT APPEAL TO REPLAY BENCH</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
