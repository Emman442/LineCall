import React, { useEffect, useState, useMemo } from 'react';
import { DisputeCard } from '../components/ui/DisputeCard';
import { EmptyState } from '../components/ui/EmptyState';
import { VerdictPill } from '../components/ui/VerdictPill';
import { Search, Filter, Plus, RefreshCw, LayoutGrid, List, Clock, Video } from 'lucide-react';
import { useDisputes } from '@/lib/hooks/useLineCall';
import { DisputeMode, DisputeStatus } from '@/lib/contracts/types';

interface BoardViewProps {
  onNavigate: (route: string) => void;
  onSelectDispute: (id: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  onNavigate,
  onSelectDispute,
}) => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'packets' | 'log'>('packets');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | DisputeStatus>('ALL');
  const [modeFilter, setModeFilter] = useState<'ALL' | DisputeMode>('ALL');
  const [sportFilter, setSportFilter] = useState<string>('ALL');

  const  {data: disputes, isPending: isFetchingDisputes} = useDisputes()



  const availableSports = useMemo(() => {
    const sports = new Set<string>();
    disputes?.forEach((d) => {
      if (d.sport) sports.add(d.sport);
    });
    return Array.from(sports);
  }, [disputes]);

  const filteredDisputes = useMemo(() => {
    return disputes?.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (modeFilter !== 'ALL' && d.mode !== modeFilter) return false;
      if (sportFilter !== 'ALL' && d.sport !== sportFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.dispute_id.toLowerCase().includes(q) ||
          d.claim.toLowerCase().includes(q) ||
          d.event_name.toLowerCase().includes(q) ||
          d.league.toLowerCase().includes(q) ||
          d.sport.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [disputes, statusFilter, modeFilter, sportFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Replay Desk Banner */}
      <div className="p-4 rounded-lg border border-[#1E242E] bg-[#0A0D13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="text-[#C8F542] font-bold tracking-widest uppercase">
              REPLAY ROOM LOG
            </span>
            <span className="text-white/30">|</span>
            <span className="text-[#9CA3AF] tabular-nums">
              {disputes?.length} Dockets on Tape
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1 font-sans">
            Public Challenge & Review Log
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Synchronized broadcast logs of disputed plays. Click any clip packet to inspect locked rules, camera angles, and committee quorum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-[#131923] p-0.5 rounded border border-[#232B38] font-mono text-xs">
            <button
              onClick={() => setViewMode('packets')}
              className={`p-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'packets' ? 'bg-[#0052FF] text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
              title="Clip Packets View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('log')}
              className={`p-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'log' ? 'bg-[#0052FF] text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
              title="Broadcast Challenge Log Table"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('/disputes/new')}
            className="px-4 py-2 rounded bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#C8F542]" />
            <span>FILE CALL</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search claim, event name, league, or docket ID (e.g. dispute_01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1E242E] bg-[#0A0D13] text-white placeholder-[#9CA3AF]/60 text-xs font-mono focus:outline-none focus:border-[#C8F542] transition-colors"
          />
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#9CA3AF] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#C8F542]" />
            <span className="text-[11px] uppercase tracking-wider">STATUS:</span>
          </span>

          {(['ALL', 'open', 'resolved', 'appealed', 'void'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-black shadow-md border-b-2 border-[#C8F542]'
                  : 'bg-[#0D121B] border border-[#1E242E] text-[#9CA3AF] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-white/20 mx-1">|</span>

          {/* Mode */}
          {(['ALL', 'data', 'call'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                modeFilter === m
                  ? 'bg-[#0052FF] text-white'
                  : 'bg-[#0D121B] border border-[#1E242E] text-[#9CA3AF] hover:text-white'
              }`}
            >
              {m === 'ALL' ? 'ALL MODES' : m}
            </button>
          ))}

          {availableSports.length > 0 && (
            <>
              <span className="text-white/20 mx-1">|</span>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-2 py-1 rounded bg-[#0D121B] border border-[#1E242E] text-[11px] text-white font-mono focus:outline-none focus:border-[#C8F542] cursor-pointer"
              >
                <option value="ALL">ALL SPORTS</option>
                {availableSports.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp.toUpperCase()}
                  </option>
                ))}
              </select>
            </>
          )}

          {(statusFilter !== 'ALL' || modeFilter !== 'ALL' || sportFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setModeFilter('ALL');
                setSportFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[#C8F542] hover:underline text-[11px] ml-auto cursor-pointer"
            >
              RESET FILTERS
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isFetchingDisputes ? (
        <div className="py-24 text-center font-mono text-xs text-[#9CA3AF]">
          Retrieving tape feed from GenLayer contract...
        </div>
      ) : filteredDisputes?.length === 0 ? (
        <EmptyState
          title={
            disputes?.length === 0
              ? 'No disputes yet. File the first public call.'
              : 'No matching dockets on tape.'
          }
          description={
            disputes?.length === 0
              ? 'When a call on the field or court is disputed, lock the rule and submit public footage sources to trigger on-chain committee arbitration.'
              : 'Try clearing your search query or adjusting your filters.'
          }
          onFileNew={() => onNavigate('/disputes/new')}
        />
      ) : viewMode === 'packets' ? (
        /* Packets grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDisputes?.map((dispute) => (
            <DisputeCard
              key={dispute?.dispute_id}
              dispute={dispute}
              onSelect={onSelectDispute}
            />
          ))}
        </div>
      ) : (
        /* Challenge Log Table view */
        <div className="rounded-lg border border-[#1E242E] bg-[#0A0D13] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111722] text-[#9CA3AF] border-b border-[#1E242E] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">DOCKET</th>
                  <th className="py-3 px-4">SPORT / LEAGUE</th>
                  <th className="py-3 px-4">EVENT & CLOCK</th>
                  <th className="py-3 px-4">DISPUTED PROPOSITION</th>
                  <th className="py-3 px-4">RULING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E242E]">
                {filteredDisputes?.map((d) => (
                  <tr
                    key={d.dispute_id}
                    onClick={() => onSelectDispute(d.dispute_id)}
                    className="hover:bg-[#131924] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#C8F542]" />
                      {d.dispute_id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[#C8F542] font-bold">{d.league}</span>
                      <span className="text-[#9CA3AF] text-[10px] block">{d.sport}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-white font-medium block truncate max-w-xs">{d.event_name}</span>
                      <span className="text-[#9CA3AF] text-[10px] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#C8F542]" />
                        {d.play_timestamp}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="text-[#D1D5DB] line-clamp-1 italic">&ldquo;{d.claim}&rdquo;</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {d.verdict ? (
                        <VerdictPill verdict={d?.verdict} size="sm" showSubtitle={true} />
                      ) : (
                        <span className="text-[10px] text-[#C8F542] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                          IN REVIEW
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
