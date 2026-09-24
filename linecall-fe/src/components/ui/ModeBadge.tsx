import React from 'react';
import { DisputeMode } from '../../types/dispute';
import { Binary, FileText } from 'lucide-react';

interface ModeBadgeProps {
  mode: DisputeMode;
  showIcon?: boolean;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode, showIcon = true }) => {
  if (mode === 'DATA') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#0052FF]/40 bg-[#0052FF]/10 text-[#0052FF] font-mono text-[11px] font-semibold tracking-wider">
        {showIcon && <Binary className="w-3 h-3 text-[#0052FF]" />}
        DATA
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#A78BFA]/40 bg-[#A78BFA]/10 text-[#A78BFA] font-mono text-[11px] font-semibold tracking-wider">
      {showIcon && <FileText className="w-3 h-3 text-[#A78BFA]" />}
      CALL
    </span>
  );
};
