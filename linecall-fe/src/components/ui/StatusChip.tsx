import { DisputeStatus } from '@/lib/contracts/types';
import React from 'react';

interface StatusChipProps {
  status: DisputeStatus;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const styles: Record<DisputeStatus, { label: string; dot: string; text: string; border: string }> = {
    open: {
      label: 'open',
      dot: 'bg-[#0052FF]',
      text: 'text-[#D1D5DB]',
      border: 'border-[#24282D]',
    },
    resolved: {
      label: 'resolved',
      dot: 'bg-[#10B981]',
      text: 'text-[#10B981]',
      border: 'border-[#10B981]/30',
    },
    appealed: {
      label: 'appealed',
      dot: 'bg-[#A78BFA]',
      text: 'text-[#A78BFA]',
      border: 'border-[#A78BFA]/30',
    },
    void: {
      label: 'void',
      dot: 'bg-[#F59E0B]',
      text: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]/30',
    },
  };

  const current = styles[status] || styles.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border bg-[#0D0F12] font-mono text-[11px] font-medium tracking-wider ${current.border} ${current.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
