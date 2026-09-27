import React, { useState } from 'react';
import { Lock, Copy, Check, ShieldCheck, FileCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface RuleLockProps {
  ruleText: string;
  ruleHash: string;
  mode?: 'DATA' | 'CALL';
}

export const RuleLock: React.FC<RuleLockProps> = ({ ruleText, ruleHash }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyHash = () => {
    navigator.clipboard.writeText(ruleHash);
    setCopied(true);
    showToast('info', 'Rule Hash Copied', ruleHash);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-[#242E3D] bg-[#0A0D13] p-4 text-xs font-mono relative overflow-hidden">
      {/* Top yard-line indicator bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E242E]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C8F542]" />
          <span className="font-bold text-white tracking-widest uppercase text-[11px] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#C8F542]" />
            IMMUTABLE STANDARD
          </span>
          <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            RULE FROZEN
          </span>
        </div>

        {/* <button
          onClick={handleCopyHash}
          title="Copy Rule Invariant Hash"
          className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
          <span className="hidden sm:inline">INVARIANT HASH:</span>
          <span className="text-[#C8F542]">{ruleHash.slice(0, 8)}...{ruleHash.slice(-6)}</span>
        </button> */}
      </div>

      {/* Official Rule text box */}
      <div className="p-3.5 rounded bg-[#07090E] border border-[#1A202A] text-white leading-relaxed whitespace-pre-wrap select-text font-mono text-[11px]">
        {ruleText}
      </div>

      {/* Replay desk invariant footnote */}
      <div className="mt-3 pt-2 text-[10px] text-[#9CA3AF] flex items-center justify-between border-t border-[#1E242E]">
        <span className="flex items-center gap-1.5">
          <FileCheck className="w-3 h-3 text-[#C8F542]" />
          Frozen at docket creation · Non-amendable by committee
        </span>
        <span className="text-[#C8F542] font-semibold">SHA-256 VERIFIED</span>
      </div>
    </div>
  );
};
