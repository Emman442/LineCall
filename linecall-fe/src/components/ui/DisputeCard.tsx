import React from 'react';

import { ModeBadge } from './ModeBadge';
import { StatusChip } from './StatusChip';
import { VerdictPill } from './VerdictPill';
import { ArrowRight, Clock, Video } from 'lucide-react';
import { Dispute } from '@/lib/contracts/types';

interface DisputeCardProps {
  dispute: Dispute;
  onSelect: (id: string) => void;
}

export const DisputeCard: React.FC<DisputeCardProps> = ({ dispute, onSelect }) => {
  // Format readable relative time
  const formattedDate = new Date(dispute.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Sport color coding for the left clip stripe
  const getSportAccentColor = (sport: string) => {
    const s = sport.toLowerCase();
    if (s.includes('basket')) return 'border-l-[#F97316]'; // Basketball orange
    if (s.includes('soccer') || s.includes('football / soccer')) return 'border-l-[#22C55E]'; // Pitch green
    if (s.includes('american football')) return 'border-l-[#EAB308]'; // Yard marker yellow
    if (s.includes('tennis')) return 'border-l-[#C8F542]'; // Court lime
    if (s.includes('baseball')) return 'border-l-[#F3F4F6]'; // Home plate chalk
    return 'border-l-[#0052FF]';
  };

  const accentBorderClass = getSportAccentColor(dispute.sport);

  return (
    <div
      onClick={() => onSelect(dispute.dispute_id)}
      className={`group relative rounded-lg border border-[#1E242E] bg-[#0B0E14] hover:bg-[#10141D] hover:border-[#333E4F] transition-all cursor-pointer flex flex-col justify-between overflow-hidden border-l-4 ${accentBorderClass} shadow-md`}
    >
      {/* Clip Packet Header with faint court-line / yard-line grid pattern */}
      <div className="relative p-4 pb-3 border-b border-[#1E242E] court-grid-pattern">
        {/* Subtle dark scrim over grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14]/40 via-transparent to-[#0B0E14] pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Docket ID & Sport */}
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-white tracking-wider group-hover:text-[#C8F542] transition-colors flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-white/50 group-hover:text-[#C8F542]" />
              {dispute.dispute_id}
            </span>
            <span className="text-white/30">|</span>
            <span className="text-[#C8F542] font-semibold text-[11px] uppercase">
              {dispute.league}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-[#9CA3AF] text-[11px]">{dispute.sport}</span>
          </div>

          {/* Micro clock badge & status */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B26] border border-[#263142] font-mono text-[10px] text-white font-bold tracking-tight">
              <Clock className="w-2.5 h-2.5 text-[#C8F542]" />
              {dispute.play_timestamp}
            </span>
            <StatusChip status={dispute.status} />
          </div>
        </div>

        {/* Event name */}
        <h3 className="relative z-10 text-sm font-bold text-white tracking-tight mt-2 line-clamp-1 group-hover:text-white">
          {dispute.event_name}
        </h3>
      </div>

      {/* Card Body: Replay Claim */}
      <div className="p-4 py-3 flex-1 flex flex-col justify-between gap-3">
        <p className="text-xs text-[#D1D5DB] line-clamp-2 leading-relaxed font-sans">
          &ldquo;{dispute.claim}&rdquo;
        </p>

        <div className="flex items-center gap-2 pt-1">
          <ModeBadge mode={dispute.mode} />
          <span className="text-[10px] font-mono text-[#9CA3AF] truncate">
            {dispute.evidence_url.replace(/^https?:\/\//, '').split('/')[0]}
          </span>
        </div>
      </div>

      {/* Card Bottom: On-screen Ruling or Awaiting Tape */}
      <div className="px-4 py-2.5 bg-[#0D1118] border-t border-[#1E242E] flex items-center justify-between text-xs">
        <div>
          {dispute.verdict ? (
            <VerdictPill verdict={dispute.verdict} size="sm" showSubtitle={true} />
          ) : (
            <span className="font-mono text-[11px] text-[#C8F542] flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
              IN REVIEW • AWAITING RESOLVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[#9CA3AF] font-mono text-[10px]">
          <span>{formattedDate}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#C8F542] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};
