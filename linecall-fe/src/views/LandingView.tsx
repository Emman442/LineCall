import React, { useMemo } from "react";
import { DisputeCard } from "../components/ui/DisputeCard";
import stadiumBg from "../assets/images/stadium_night_pitch_1790166323840.jpg";
import {
  ArrowRight,
  Video,
  Clock,
  Flag,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useDisputes } from "@/lib/hooks/useLineCall"; // fix path if needed
import type { Dispute } from "@/lib/contracts/types";

interface LandingViewProps {
  onNavigate: (route: string) => void;
  onSelectDispute: (id: string) => void;
}

function voidRate(total: number, voids: number) {
  if (!total) return "0.0%";
  return `${((voids / total) * 100).toFixed(1)}%`;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onSelectDispute,
}) => {
  const { data: disputes = [], isLoading } = useDisputes();

  const stats = useMemo(() => {
    const total = disputes.length;
    const resolved = disputes.filter((d) =>
      ["resolved", "appealed"].includes(String(d.status))
    ).length;
    const voids = disputes.filter(
      (d) => d.status === "void" || d.verdict === "VOID"
    ).length;
    const appealed = disputes.filter((d) => d.appeal_used).length;
    const overturned = disputes.filter(
      (d) => d.appeal_used && d.status === "appealed"
    ).length;

    return {
      total,
      resolved,
      voidRate: voidRate(total, voids),
      appealed,
      overturned,
    };
  }, [disputes]);

  const recentDisputes = useMemo(
    () =>
      [...disputes]
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 3),
    [disputes]
  );

  return (
    <div className="space-y-16 pb-12">
      {/* keep your existing hero JSX exactly */}

      <section className="relative w-full overflow-hidden border-b border-[#1E242E] pt-12 pb-16">
        {/* Arena plate backdrop */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen">
          <img
            src={stadiumBg}
            alt="Darkened stadium floodlights"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-125"
            referrerPolicy="no-referrer"
          />
        </div>    {/* Soft floodlight bloom overhead */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[350px] pointer-events-none opacity-25 blur-3xl rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200, 245, 66, 0.45) 0%, rgba(0, 82, 255, 0.2) 50%, transparent 80%)',
          }}
        />

        {/* Scanline overlay */}
        <div className="absolute inset-0 broadcast-scanlines pointer-events-none opacity-35" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Match Bug Style Chip: NBA • Q4 • CHALLENGE */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0A0E16] border border-[#2B3545] font-mono text-xs text-white mb-6 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="font-extrabold text-[#C8F542] tracking-wider">OFFICIAL REPLAY DESK</span>
            <span className="text-white/30">|</span>
            <span className="text-white font-semibold tracking-wide">NBA • Q4 • CHALLENGE</span>
            <span className="text-white/30">|</span>
            <span className="text-[#9CA3AF] text-[11px]">VAR ACTIVE</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-sans text-balance leading-[1.08] mb-6">
            Public tape. Locked rules. <br className="hidden sm:inline" />
            <span className="text-[#C8F542] drop-shadow-[0_0_25px_rgba(200,245,66,0.3)]">On-chain call.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#D1D5DB] max-w-2xl mx-auto leading-relaxed mb-8 text-balance font-sans">
            Disputed plays settled from public sources. Validators fetch the same pages. The chain stores <span className="text-[#22C55E] font-mono font-bold uppercase">YES</span>, <span className="text-[#E11D48] font-mono font-bold uppercase">NO</span>, or <span className="text-[#F5A524] font-mono font-bold uppercase">VOID</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Primary protocol action */}
            <button
              onClick={() => onNavigate('/disputes/new')}
              className="px-6 py-3 rounded bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,82,255,0.4)] flex items-center gap-2 cursor-pointer border border-[#0052FF]"
            >
              <span>FILE A DISPUTE</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            {/* Secondary CTA: outlined chalk white "GO TO REPLAY" feel */}
            <button
              onClick={() => onNavigate('/disputes')}
              className="px-6 py-3 rounded border-2 border-white bg-[#0A0E16]/80 hover:bg-white hover:text-black text-white text-xs font-mono font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>OPEN THE BOARD · GO TO REPLAY</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>



      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-lg border-2 border-[#1E242E] bg-[#0A0D14] overflow-hidden">
          <div className="bg-[#111722] px-4 py-1.5 border-b border-[#1E242E] flex items-center gap-2 font-mono text-[10px] uppercase text-[#9CA3AF]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-white font-bold">GENLAYER REPLAY SCOREBUG</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#1E242E] text-center font-mono">
            <div className="p-4 bg-[#080B10]">
              <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest block">
                FILED
              </span>
              <p className="text-3xl sm:text-4xl font-black text-white mt-1 tabular-nums">
                {stats.total}
              </p>
            </div>
            <div className="p-4 bg-[#080B10]">
              <span className="text-[10px] text-[#22C55E] font-bold uppercase tracking-widest block">
                CONFIRMED
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#22C55E] mt-1 tabular-nums">
                {stats.resolved}
              </p>
            </div>
            <div className="p-4 bg-[#080B10]">
              <span className="text-[10px] text-[#F5A524] font-bold uppercase tracking-widest block">
                VOID RATE
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#F5A524] mt-1 tabular-nums">
                {stats.voidRate}
              </p>
            </div>
            <div className="p-4 bg-[#080B10]">
              <span className="text-[10px] text-[#E11D48] font-bold uppercase tracking-widest block">
                OVERTURNED
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#E11D48] mt-1 tabular-nums">
                {stats.overturned}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* keep pipeline section as-is */}

      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#C8F542] mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>OFFICIAL REPLAY MECHANICS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How The Replay Desk Resolves Calls
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 01: Whistle & Rule Lock */}
          <div className="relative rounded-lg border border-[#242E3D] bg-[#0A0D13] p-6 flex flex-col justify-between overflow-hidden group hover:border-[#C8F542] transition-colors">
            {/* Court line pattern */}
            <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded bg-[#131924] border border-[#2B3545] flex items-center justify-center text-[#C8F542]">
                  {/* Whistle / Gavel glyph */}
                  <ShieldCheck className="w-5 h-5 text-[#C8F542]" />
                </div>
                <span className="font-mono text-xs font-bold text-white/40">STEP 01</span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 font-mono">
                FREEZE RULE INVARIANT
              </h3>
              <p className="text-xs text-[#D1D5DB] leading-relaxed">
                Submit the yes/no proposition and quote the league rule book section. The standard is cryptographically hashed and locked against retrospective amendment.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-[#1E242E] flex items-center justify-between font-mono text-[10px] text-[#9CA3AF]">
              <span className="text-[#C8F542] font-semibold">LOCKED STANDARD</span>
              <span>SHA-256</span>
            </div>
          </div>

          {/* Card 02: High-speed Camera & Angles */}
          <div className="relative rounded-lg border border-[#242E3D] bg-[#0A0D13] p-6 flex flex-col justify-between overflow-hidden group hover:border-[#C8F542] transition-colors">
            {/* Court line pattern */}
            <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded bg-[#131924] border border-[#2B3545] flex items-center justify-center text-[#22C55E]">
                  {/* Camera / Tape Angle glyph */}
                  <Video className="w-5 h-5 text-[#22C55E]" />
                </div>
                <span className="font-mono text-xs font-bold text-white/40">STEP 02</span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 font-mono">
                POINT AT PUBLIC TAPE
              </h3>
              <p className="text-xs text-[#D1D5DB] leading-relaxed">
                Provide public, fetchable URLs: official recap recaps, tracking telemetry JSON, or league play-by-play timelines accessible without login paywalls.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-[#1E242E] flex items-center justify-between font-mono text-[10px] text-[#9CA3AF]">
              <span className="text-[#22C55E] font-semibold">HTTP 200 PUBLIC</span>
              <span>VERIFIABLE TAPE</span>
            </div>
          </div>

          {/* Card 03: Challenge Flag & Consensus Verdict */}
          <div className="relative rounded-lg border border-[#242E3D] bg-[#0A0D13] p-6 flex flex-col justify-between overflow-hidden group hover:border-[#C8F542] transition-colors">
            {/* Court line pattern */}
            <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded bg-[#131924] border border-[#2B3545] flex items-center justify-center text-[#F5A524]">
                  {/* Challenge flag glyph */}
                  <Flag className="w-5 h-5 text-[#F5A524]" />
                </div>
                <span className="font-mono text-xs font-bold text-white/40">STEP 03</span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 font-mono">
                COMMITTEE RENDERS CALL
              </h3>
              <p className="text-xs text-[#D1D5DB] leading-relaxed">
                GenLayer validators autonomously fetch the exact feeds, agree on facts, and commit an immutable on-screen ruling (YES / NO / VOID) to the chain.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-[#1E242E] flex items-center justify-between font-mono text-[10px] text-[#9CA3AF]">
              <span className="text-[#F5A524] font-semibold">QUORUM SIGNED</span>
              <span>ONE-WORD RULING</span>
            </div>
          </div>
        </div>
      </section>



      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1E242E]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-pulse" />
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
              LIVE CHALLENGE LOG
            </h2>
          </div>
          <button
            onClick={() => onNavigate("/disputes")}
            className="text-xs font-mono font-bold text-[#C8F542] flex items-center gap-1"
          >
            FULL TAPE LOG
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-[#9CA3AF]">
            Synchronizing broadcast feeds...
          </div>
        ) : recentDisputes.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-[#9CA3AF]">
            No dockets yet. File the first public call.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.dispute_id}
                dispute={dispute}
                onSelect={() => onSelectDispute(dispute.dispute_id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};