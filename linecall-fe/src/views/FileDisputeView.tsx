import React, { useState } from 'react';
import { useWallet } from '../../lib/genlayer/wallet';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, CheckCircle2, Clock, Video } from 'lucide-react';
import { CreateDisputeInput, DisputeMode } from '@/lib/contracts/types';
import { useCreateDispute } from '@/lib/hooks/useLineCall';

interface FileDisputeViewProps {
  onNavigate: (route: string) => void;
  onDisputeCreated: (id: string) => void;
}

export const FileDisputeView: React.FC<FileDisputeViewProps> = ({
  onNavigate,
  onDisputeCreated,
}) => {
  const { isConnected, connectWallet, address } = useWallet();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);


  const VIDEO_RE =
  /\.(mp4|webm|mov|m3u8)(\?|$)/i;
const VIDEO_HOST =
  /youtube\.com|youtu\.be|vimeo\.com|twitch\.tv/i;

function isBadSource(url: string) {
  const u = url.trim();
  if (!u) return false;
  return VIDEO_RE.test(u) || VIDEO_HOST.test(u);
}

// mode state
const [mode, setMode] = useState<DisputeMode>("call");
const [comparison, setComparison] = useState<">" | ">=" | "<" | "<=" | "==">(">");

const { createDisputeAsync, isCreating } = useCreateDispute();

  // Form states
  const [sport, setSport] = useState('Basketball');
  const [league, setLeague] = useState('NBA');
  const [eventName, setEventName] = useState('Golden State Warriors vs LA Lakers — Game 6');
  const [playTimestamp, setPlayTimestamp] = useState('2026-09-23 Q4 00:00.6');
  const [claim, setClaim] = useState(
    'The game-winning putback layup released from the offensive player’s hand before the red backboard back-light illuminated.'
  );


  const [ruleText, setRuleText] = useState(
    'NBA Rule 13 Section I: To count, the basketball must be completely airborne and out of the player’s grasp prior to the backboard LEDs illuminating red or the game horn sounding.'
  );
  const [jsonFieldPath, setJsonFieldPath] = useState('play.release_time_remaining_ms');
  const [targetValue, setTargetValue] = useState('0');

  const [evidenceUrl, setEvidenceUrl] = useState(
    'https://nba.com/official-recap/2026-gsw-lal-g6-final-play'
  );
  const [fallbackUrl, setFallbackUrl] = useState(
    'https://stats.nba.com/game/0042500412/playbyplay'
  );
  const [statsUrl, setStatsUrl] = useState('');

  const loadPreset = (preset: 'buzzer' | 'var' | 'tennis') => {
    if (preset === 'buzzer') {
      setSport('Basketball');
      setLeague('NBA');
      setEventName('Miami Heat vs Boston Celtics — Regular Season');
      setPlayTimestamp('2026-09-23 Q4 00:00.2');
      setClaim('The turnaround baseline jumper beat the shot clock buzzer.');
      setMode('call');
      setRuleText(
        'NBA Rule 13: The ball must be airborne prior to 24-second shot clock horn sounding and yellow backboard strip illumination.'
      );
      setEvidenceUrl('https://nba.com/recap/2026-heat-celtics-shotclock-review');
      setFallbackUrl('https://stats.nba.com/game/0022600105/playbyplay');
      setStatsUrl('');
    } else if (preset === 'var') {
      setSport('Football / Soccer');
      setLeague('Premier League');
      setEventName('Manchester City vs Liverpool');
      setPlayTimestamp('2026-09-23 93:40');
      setClaim('The striker was positioned in front of the defensive offside line.');
      setMode('data');
      setRuleText(
        'Premier League VAR Standard: Offside margin must be greater than 0 mm at point of ball contact.'
      );
      setJsonFieldPath('telemetry.hawkeye_offside_margin_mm');
      setComparison('>');
      setTargetValue('0');
      setEvidenceUrl('https://premierleague.com/telemetry/match/98214/var-offside.json');
      setFallbackUrl('https://premierleague.com/match/98214/match-centre');
      setStatsUrl('https://api.premierleague.com/stats/98214');
    } else {
      setSport('Tennis');
      setLeague('Wimbledon');
      setEventName('Gentlemen’s Singles Semi-Final');
      setPlayTimestamp('2026-09-23 S3 5-4 (40-30)');
      setClaim('The passing shot clipped the outer baseline chalk.');
      setMode('data');
      setRuleText(
        'ITF Rules of Tennis: If any part of the ball touches the line, it is inside the court (distance <= 0.0mm).'
      );
      setJsonFieldPath('shot.hawk_eye_line_distance_mm');
      setComparison('<=');
      setTargetValue('0.0');
      setEvidenceUrl('https://wimbledon.com/points/2026-sf-set3-pt22.json');
      setFallbackUrl('');
      setStatsUrl('');
    }
    showToast('info', 'Loaded template', `${preset.toUpperCase()} replay template loaded.`);
  };

  const isStep1Valid =
    sport.trim().length > 0 &&
    league.trim().length > 0 &&
    eventName.trim().length > 0 &&
    playTimestamp.trim().length > 0 &&
    claim.trim().length >= 10;

const isStep2Valid =
  ruleText.trim().length >= 20 &&
  (mode === "call" ||
    (jsonFieldPath.trim().length > 0 && targetValue.trim().length > 0));

  const isStep3Valid =
    evidenceUrl.trim().length >= 8 && evidenceUrl.startsWith('http');

  const handleSubmit = async () => {
  if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
    showToast("error", "Incomplete Form", "Review required fields.");
    return;
  }
  if (!isConnected) {
    connectWallet();
    return;
  }
  if (
    isBadSource(evidenceUrl) ||
    isBadSource(fallbackUrl) ||
    isBadSource(statsUrl)
  ) {
    showToast(
      "error",
      "Video URL blocked",
      "Use public HTML recap or JSON. GenLayer cannot watch video."
    );
    return;
  }

  setSubmitting(true);
  try {
    const input: CreateDisputeInput = {
      sport: sport.trim(),
      league: league.trim(),
      event_name: eventName.trim(),
      play_timestamp: playTimestamp.trim(),
      claim: claim.trim(),
      rule_text: ruleText.trim(),
      mode,
      evidence_url: evidenceUrl.trim(),
      evidence_url_fallback: fallbackUrl.trim() || "",
      stats_url: statsUrl.trim() || "",
      json_field_path: mode === "data" ? jsonFieldPath.trim() : "",
      comparison: mode === "data" ? comparison : "",
      target_value: mode === "data" ? targetValue.trim() : "",
    };

    await createDisputeAsync({ input });
    showToast("success", "Dispute Published", "Claim and rule are locked.");
    onNavigate("/disputes");
  } catch (err: any) {
    showToast("error", "Publication Failed", err?.message || "Transaction failed");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/disputes')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9CA3AF] hover:text-[#C8F542] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO CHALLENGE LOG</span>
        </button>

        {/* Quick template loader */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#9CA3AF] font-mono text-[11px] hidden sm:inline uppercase">
            TEMPLATES:
          </span>
          <button
            onClick={() => loadPreset('buzzer')}
            className="px-2 py-0.5 rounded bg-[#121824] border border-[#242E3D] hover:border-[#C8F542] text-white font-mono text-[11px] cursor-pointer"
          >
            NBA BUZZER
          </button>
          <button
            onClick={() => loadPreset('var')}
            className="px-2 py-0.5 rounded bg-[#121824] border border-[#242E3D] hover:border-[#C8F542] text-white font-mono text-[11px] cursor-pointer"
          >
            VAR OFFSIDE
          </button>
          <button
            onClick={() => loadPreset('tennis')}
            className="px-2 py-0.5 rounded bg-[#121824] border border-[#242E3D] hover:border-[#C8F542] text-white font-mono text-[11px] cursor-pointer"
          >
            HAWK-EYE CHALK
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="p-5 rounded-lg border border-[#1E242E] bg-[#0A0D13]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#C8F542] uppercase font-bold">
          <Video className="w-4 h-4 text-[#C8F542]" />
          <span>OFFICIAL CALL INGESTION</span>
          <span className="text-white/30">|</span>
          <span className="text-white">GENLAYER PROTOCOL</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1 font-sans">
          File Disputed Play for Public Review
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Lock the standard rule and specify public recap endpoints. Once published, the rule is frozen and validators will autonomously fetch the sources to deliver an immutable verdict.
        </p>
      </div>

      {/* Wizard Step Indicator */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono border-b border-[#1E242E] pb-3">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 pb-2 border-b-2 text-left transition-colors cursor-pointer ${
            step === 1
              ? 'border-[#C8F542] text-[#C8F542] font-bold'
              : step > 1
              ? 'border-[#22C55E] text-[#22C55E]'
              : 'border-transparent text-[#9CA3AF]'
          }`}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center bg-[#131923] border border-[#232B38] text-[11px]">
            {step > 1 ? '✓' : '1'}
          </span>
          <span>PLAY & CLAIM</span>
        </button>

        <button
          onClick={() => isStep1Valid && setStep(2)}
          className={`flex items-center gap-2 pb-2 border-b-2 text-left transition-colors cursor-pointer ${
            step === 2
              ? 'border-[#C8F542] text-[#C8F542] font-bold'
              : step > 2
              ? 'border-[#22C55E] text-[#22C55E]'
              : 'border-transparent text-[#9CA3AF]'
          }`}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center bg-[#131923] border border-[#232B38] text-[11px]">
            {step > 2 ? '✓' : '2'}
          </span>
          <span>RULE & MODE</span>
        </button>

        <button
          onClick={() => isStep1Valid && isStep2Valid && setStep(3)}
          className={`flex items-center gap-2 pb-2 border-b-2 text-left transition-colors cursor-pointer ${
            step === 3
              ? 'border-[#C8F542] text-[#C8F542] font-bold'
              : 'border-transparent text-[#9CA3AF]'
          }`}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center bg-[#131923] border border-[#232B38] text-[11px]">
            3
          </span>
          <span>PUBLIC ANGLES</span>
        </button>
      </div>

      {/* Wizard Step Content */}
      <div className="rounded-lg border border-[#1E242E] bg-[#0A0D13] p-6 space-y-6">
        {/* STEP 1: PLAY & CLAIM */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#9CA3AF] mb-1.5 font-bold">
                  Sport *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Basketball, Football, Tennis"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#C8F542]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#9CA3AF] mb-1.5 font-bold">
                  League / Competition *
                </label>
                <input
                  type="text"
                  placeholder="e.g. NBA, Premier League, NFL"
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#C8F542]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#9CA3AF] mb-1.5 font-bold">
                Event / Match Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Boston Celtics vs New York Knicks — Game 7"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#C8F542]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#9CA3AF] mb-1.5 font-bold">
                Play Marker (Broadcast Clock Timestamp) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8F542]" />
                <input
                  type="text"
                  placeholder="e.g. 2026-09-21 Q4 00:01.2 or 88:14"
                  value={playTimestamp}
                  onChange={(e) => setPlayTimestamp(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs font-mono focus:outline-none focus:border-[#C8F542]"
                />
              </div>
              <span className="text-[11px] text-[#9CA3AF] mt-1 block font-mono">
                Identify the exact quarter, minute, and sub-second timestamp on the broadcast game clock.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#9CA3AF] mb-1.5 font-bold">
                Disputed Proposition (Yes/No Claim) *
              </label>
              <textarea
                rows={3}
                placeholder="Write a yes/no proposition. Example: The last field goal beat the buzzer."
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                className="w-full px-3 py-2.5 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs leading-relaxed focus:outline-none focus:border-[#C8F542]"
              />
              <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mt-1 font-mono">
                <span>Must be an affirmative condition evaluating to YES or NO.</span>
                <span>{claim.length} chars</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: RULE & MODE */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            {/* Mode toggle */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#9CA3AF] mb-2 font-bold">
                Review Mode *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('call')}
                  className={`p-3.5 rounded border text-left transition-all cursor-pointer ${
                    mode === 'call'
                      ? 'border-[#C8F542] bg-[#C8F542]/10'
                      : 'border-[#1E242E] bg-[#07090E] hover:border-[#333E4F]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">CALL MODE</span>
                    <span className="text-[10px] font-mono text-[#C8F542] px-1 py-0.5 rounded bg-[#C8F542]/20 font-bold">
                      LANGUAGE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                    Evaluates natural language consensus from public recap text, pool reports, and frame transcripts.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('data')}
                  className={`p-3.5 rounded border text-left transition-all cursor-pointer ${
                    mode === 'data'
                      ? 'border-[#0052FF] bg-[#0052FF]/10'
                      : 'border-[#1E242E] bg-[#07090E] hover:border-[#333E4F]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">DATA MODE</span>
                    <span className="text-[10px] font-mono text-[#0052FF] px-1 py-0.5 rounded bg-[#0052FF]/20 font-bold">
                      TELEMETRY
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                    Extracts numerical field from public stats/telemetry payload and compares against target threshold.
                  </p>
                </button>
              </div>
            </div>

            {/* Rule Text */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <label className="text-xs uppercase text-[#9CA3AF] flex items-center gap-1.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-[#C8F542]" />
                  <span>RULE TEXT (IMMUTABLE STANDARD) *</span>
                </label>
                <span className="text-[11px] text-[#9CA3AF]">
                  min ~20 chars ({ruleText.length})
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Paste the official rule section text here (e.g. NBA Rule 13 Section I...)"
                value={ruleText}
                onChange={(e) => setRuleText(e.target.value)}
                className="w-full px-3 py-2.5 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-[#C8F542]"
              />
              <span className="text-[11px] text-[#9CA3AF] mt-1 block font-mono">
                This text is immutable after publish. Validators will measure the public evidence strictly against this exact wording.
              </span>
            </div>

            {/* DATA Mode Fields */}
            {mode === 'data' && (
              <div className="p-4 rounded bg-[#07090E] border border-[#1E242E] space-y-3">
                <span className="text-xs font-mono uppercase text-[#0052FF] font-bold block">
                  DATA MODE TELEMETRY SPECIFICATION
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="block text-[10px] text-[#9CA3AF] mb-1 uppercase font-bold">
                      JSON FIELD PATH *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. play.margin_mm"
                      value={jsonFieldPath}
                      onChange={(e) => setJsonFieldPath(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#0A0D13] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#9CA3AF] mb-1 uppercase font-bold">
                      OPERATOR *
                    </label>
                    <select
                      value={comparison}
                      onChange={(e) =>
                        setComparison(e.target.value as ">" | ">=" | "<" | "<=" | "==")
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-[#0A0D13] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#0052FF]"
                    >
                      <option value=">">&gt; (Greater)</option>
                      <option value=">=">&gt;= (Greater or equal)</option>
                      <option value="<">&lt; (Less)</option>
                      <option value="<=">&lt;= (Less or equal)</option>
                      <option value="==">== (Exact match)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#9CA3AF] mb-1 uppercase font-bold">
                      TARGET THRESHOLD *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0.0"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#0A0D13] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PUBLIC SOURCES */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in font-mono">
            <div className="p-3.5 rounded bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-start gap-2.5 text-xs text-[#F5A524]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <span className="font-bold uppercase">Public Fetchability Requirement:</span> Pages must be publicly accessible via standard HTTP GET by GenLayer validator nodes. Prefer recap HTML, news summaries, or JSON telemetry APIs. Do not submit raw multi-gigabyte video files or behind-paywall URLs.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase text-[#9CA3AF] mb-1.5 font-bold">
                ANGLE 01: PRIMARY RECAP URL * (REQUIRED)
              </label>
              <input
                type="url"
                placeholder="https://nba.com/official-recap/... or https://league.com/telemetry.json"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#C8F542]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-[#9CA3AF] mb-1.5 font-bold">
                ANGLE 02: FALLBACK MIRROR URL (OPTIONAL)
              </label>
              <input
                type="url"
                placeholder="https://stats.nba.com/game/... (optional backup)"
                value={fallbackUrl}
                onChange={(e) => setFallbackUrl(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#C8F542]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-[#9CA3AF] mb-1.5 font-bold">
                TELEMETRY FEED: JSON DATA FEED URL (OPTIONAL)
              </label>
              <input
                type="url"
                placeholder="https://cdn.league.com/liveData/playbyplay.json"
                value={statsUrl}
                onChange={(e) => setStatsUrl(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#07090E] border border-[#1E242E] text-white text-xs focus:outline-none focus:border-[#C8F542]"
              />
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-[#1E242E]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-[#1E242E] hover:bg-[#131923] text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              PREVIOUS
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-[#0052FF] hover:bg-[#0047E0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              NEXT STEP
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {!isConnected ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="px-4 py-2 rounded border border-[#0052FF] text-[#0052FF] hover:bg-[#0052FF]/10 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  CONNECT WALLET FIRST
                </button>
              ) : null}

              <button
                type="button"
                disabled={!isStep3Valid || submitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#0052FF] hover:bg-[#0047E0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,82,255,0.4)] cursor-pointer border border-[#0052FF]"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>FREEZING & PUBLISHING...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#C8F542]" />
                    <span>PUBLISH DISPUTE</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
