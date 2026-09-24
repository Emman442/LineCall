import React, { useState, useEffect } from 'react';
import { WalletButton } from './ui/WalletButton';
import { LayoutGrid, Plus } from 'lucide-react';
import { useWallet } from '@/lib/genlayer/wallet';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { connectWallet, address: wallet, disconnectWallet } = useWallet()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E242E] bg-[#07090E]/95 backdrop-blur-md">
      {/* Top micro-tally strip across header */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#0052FF] via-[#C8F542] to-[#E11D48] opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: LineCall Wordmark with vertical replay bar & whistle glyph */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            {/* Replay bar icon (Dual vertical tape slit + whistle reticle) */}
            <div className="relative w-8 h-8 rounded bg-[#0D121B] border border-[#242E3D] flex items-center justify-center group-hover:border-[#C8F542] transition-colors overflow-hidden">
              {/* Vertical replay split bars */}
              <div className="flex items-center gap-1">
                <div className="w-1 h-4 bg-[#C8F542] rounded-full" />
                <div className="w-1 h-4 bg-white/80 rounded-full" />
                <div className="w-0.5 h-3 bg-[#E11D48] rounded-full animate-pulse" />
              </div>
              {/* Subtle crosshair line */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans flex items-center gap-1.5">
                LineCall
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#C8F542] border border-[#C8F542]/40 px-1 py-0 rounded bg-[#C8F542]/10 uppercase">
                  VAR
                </span>
              </span>
            </div>
          </button>

          {/* Navigation links styled as broadcast controls */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => onNavigate('/disputes')}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 ${currentRoute === '/disputes'
                  ? 'text-white bg-[#131923] border border-[#2B3545] shadow-inner'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>CHALLENGE LOG</span>
            </button>
            <button
              onClick={() => onNavigate('/disputes/new')}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 ${currentRoute === '/disputes/new'
                  ? 'text-white bg-[#131923] border border-[#2B3545]'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#C8F542]" />
              <span>FILE CALL</span>
            </button>
          </nav>
        </div>


        <div className="flex items-center shrink-0">
          {wallet ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#C8F542] px-2.5 py-1.5 rounded border border-[#242E3D] bg-[#0D121B]">
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </span>
              <button
                type="button"
                onClick={() => disconnectWallet()}
                className="text-[10px] font-mono uppercase tracking-wider text-[#EF4444] border border-[#EF4444]/40 px-2.5 py-1.5 rounded hover:bg-[#EF4444]/10"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => connectWallet()}
              className="px-3 py-1.5 rounded bg-[#C8F542] text-black text-xs font-bold uppercase tracking-wider"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden border-t border-[#1E242E] bg-[#07090E] px-4 py-2 justify-around text-xs font-mono">
        <button
          onClick={() => onNavigate('/')}
          className={`px-2 py-1 rounded ${currentRoute === '/' ? 'text-[#C8F542] font-bold' : 'text-[#9CA3AF]'}`}
        >
          DESK
        </button>
        <button
          onClick={() => onNavigate('/disputes')}
          className={`px-2 py-1 rounded ${currentRoute === '/disputes' ? 'text-[#C8F542] font-bold' : 'text-[#9CA3AF]'}`}
        >
          LOG
        </button>
        <button
          onClick={() => onNavigate('/disputes/new')}
          className={`px-2 py-1 rounded ${currentRoute === '/disputes/new' ? 'text-[#C8F542] font-bold' : 'text-[#9CA3AF]'}`}
        >
          + FILE
        </button>
      </div>
    </header>
  );
};
