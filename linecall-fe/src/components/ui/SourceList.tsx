import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Video, Radio } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SourceListProps {
  evidenceUrl: string;
  fallbackUrl?: string;
  statsUrl?: string;
}

export const SourceList: React.FC<SourceListProps> = ({
  evidenceUrl,
  fallbackUrl,
  statsUrl,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('info', 'Feed URL Copied', url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const angles = [
    {
      label: 'ANGLE 01',
      title: 'PRIMARY BROADCAST FEED / RECAP TAPE',
      url: evidenceUrl,
      status: 'SIGNAL LOCKED (HTTP 200)',
      tallyColor: 'bg-[#22C55E]',
    },
    ...(fallbackUrl
      ? [
          {
            label: 'ANGLE 02',
            title: 'SECONDARY HIGH-CAMERA MIRROR',
            url: fallbackUrl,
            status: 'STANDBY FEED',
            tallyColor: 'bg-[#C8F542]',
          },
        ]
      : []),
    ...(statsUrl
      ? [
          {
            label: 'TELEMETRY',
            title: 'STATISTICAL OPTICAL PAYLOAD (JSON)',
            url: statsUrl,
            status: 'DATA SYNCED',
            tallyColor: 'bg-[#0052FF]',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#C8F542]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            PUBLIC REPLAY ANGLES & TELEMETRY
          </h4>
        </div>
        <span className="text-[10px] font-mono text-[#22C55E] flex items-center gap-1.5 font-bold uppercase">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          BROADCAST FEEDS ACCESSIBLE
        </span>
      </div>

      <div className="space-y-2">
        {angles.map((angle, i) => (
          <div
            key={i}
            className="p-3 rounded border border-[#1E242E] bg-[#0A0D13] flex flex-col gap-1.5 transition-colors hover:border-[#333E4F]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${angle.tallyColor}`} />
                <span className="font-bold text-[#C8F542]">{angle.label}</span>
                <span className="text-white/40">·</span>
                <span className="text-white text-[10px] tracking-wide">{angle.title}</span>
              </div>
              <span className="text-[9px] text-[#9CA3AF] px-1.5 py-0.5 rounded bg-[#131923] border border-[#222B38]">
                {angle.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <a
                href={angle.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-xs text-[#0052FF] hover:text-[#C8F542] truncate flex items-center gap-1.5 group transition-colors"
              >
                <span className="truncate">{angle.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>

              <button
                onClick={() => handleCopy(angle.url)}
                className="text-[#9CA3AF] hover:text-white transition-colors p-1 shrink-0 cursor-pointer"
                title="Copy angle feed URL"
              >
                {copiedUrl === angle.url ? (
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcaster Note */}
      <div className="p-2.5 rounded bg-[#0D121B] border border-[#1E242E] text-[11px] text-[#9CA3AF] font-mono flex items-start gap-2">
        <Radio className="w-3.5 h-3.5 text-[#C8F542] shrink-0 mt-0.5" />
        <span>
          Footage is judged from the public page text, recap timeline markers, and telemetry payload. Raw video frames are cross-examined against publicly archived play transcripts.
        </span>
      </div>
    </div>
  );
};
