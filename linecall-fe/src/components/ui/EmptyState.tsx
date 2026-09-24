import React from 'react';
import { Scale, Plus } from 'lucide-react';

interface EmptyStateProps {
  onFileNew?: () => void;
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onFileNew,
  title = 'No disputes yet. File the first public call.',
  description = 'When a call on the field or court is disputed, lock the rule and submit public footage sources to trigger on-chain committee arbitration.',
}) => {
  return (
    <div className="rounded-xl border border-dashed border-[#24282D] bg-[#0D0F12]/60 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-lg bg-[#121417] border border-[#24282D] flex items-center justify-center mb-4 text-[#9CA3AF]">
        <Scale className="w-6 h-6 text-[#0052FF]" />
      </div>
      <h3 className="text-base font-semibold text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-xs text-[#9CA3AF] max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {onFileNew && (
        <button
          onClick={onFileNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          File New Dispute
        </button>
      )}
    </div>
  );
};
