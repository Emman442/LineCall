import React from "react";

type VerdictKey = "YES" | "NO" | "VOID";

interface VerdictPillProps {
  verdict?: string | null;
  size?: "sm" | "md" | "lg" | "giant";
  showSubtitle?: boolean;
}

const CONFIG = {
  YES: {
    label: "YES",
    badgeTitle: "CALL CONFIRMED",
    subtitle: "STANDS AS CLAIMED",
    tally: "bg-[#22C55E]",
    border: "border-[#22C55E]",
    bg: "bg-[#0A1D13]",
    text: "text-[#22C55E]",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.25)]",
  },
  NO: {
    label: "NO",
    badgeTitle: "CALL OVERTURNED",
    subtitle: "REPLAY REVERSAL",
    tally: "bg-[#E11D48]",
    border: "border-[#E11D48]",
    bg: "bg-[#220B10]",
    text: "text-[#E11D48]",
    glow: "shadow-[0_0_20px_rgba(225,29,72,0.25)]",
  },
  VOID: {
    label: "VOID",
    badgeTitle: "INCONCLUSIVE EVIDENCE",
    subtitle: "CHALLENGE FLAG VOID",
    tally: "bg-[#F5A524]",
    border: "border-[#F5A524]",
    bg: "bg-[#201505]",
    text: "text-[#F5A524]",
    glow: "shadow-[0_0_20px_rgba(245,165,36,0.25)]",
  },
} as const;

export const VerdictPill: React.FC<VerdictPillProps> = ({
  verdict,
  size = "md",
  showSubtitle = false,
}) => {
  const key = String(verdict || "").toUpperCase() as VerdictKey;
  if (key !== "YES" && key !== "NO" && key !== "VOID") return null;

  const config = CONFIG[key];

  if (size === "giant") {
    return (
      <div
        className={`relative overflow-hidden border-2 ${config.border} ${config.bg} ${config.glow} px-6 py-4 rounded-md text-left max-w-md mx-auto`}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 font-mono text-[10px] tracking-widest uppercase text-white/80">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${config.tally} animate-pulse`} />
            <span className="font-bold text-white">{config.badgeTitle}</span>
          </div>
          <span className="text-[#C8F542] font-semibold">GENLAYER REPLAY DESK</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className={`font-mono text-5xl sm:text-6xl font-black ${config.text}`}>
            {config.label}
          </span>
          <div className="text-right">
            <span className="block font-mono text-xs font-bold uppercase text-white">
              {config.subtitle}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 border-l-4 ${config.border} border-y border-r border-white/15 ${config.bg} font-mono text-xs font-bold uppercase`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.tally}`} />
        <span className={`text-sm font-extrabold ${config.text}`}>{config.label}</span>
        {showSubtitle && (
          <span className="text-[11px] text-white/80 pl-1 border-l border-white/20">
            {config.badgeTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border-l-2 ${config.border} border-t border-b border-r border-white/10 ${config.bg} font-mono font-bold text-[11px]`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.tally}`} />
      <span className={config.text}>{config.label}</span>
    </span>
  );
};