import React from 'react';
import { ExternalLink, Video } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1E242E] bg-[#07090E] py-8 text-xs text-[#9CA3AF] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#1E242E]">
          <div>
            <div className="flex items-center gap-2 text-white font-bold mb-1">
              <Video className="w-4 h-4 text-[#C8F542]" />
              <span className="font-sans text-sm tracking-tight font-extrabold">
                LineCall Replay Desk
              </span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-[#C8F542]/20 text-[#C8F542] border border-[#C8F542]/40 uppercase font-bold">
                VAR Quorum
              </span>
            </div>
            <p className="text-[#9CA3AF] max-w-md text-xs leading-relaxed font-sans">
              Autonomous AI sports referee and public evidence consensus. Disputed plays resolved on-chain from public broadcasts, recaps, and telemetry APIs.
            </p>
          </div>

          <div className="font-mono text-[11px] space-y-1">
            <div className="flex items-center gap-2">
              
            </div>
            {/* <div className="flex items-center gap-2">
              <span className="text-[#9CA3AF]">CONSENSUS RPC:</span>
              <span className="text-[#D1D5DB]">{GL_RPC_ENDPOINT}</span>
            </div> */}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]">
          <p className="text-[#9CA3AF]">
            Recorded by GenLayer consensus. Not an official league ruling. All dockets are permanent public tape records.
          </p>
          <div className="flex items-center gap-4 text-[#9CA3AF]">
            <span className="hover:text-white transition-colors cursor-pointer">Protocol Standard</span>
            <span>·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Validator Quorum</span>
            <span>·</span>
            <a
              href="https://genlayer.com"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>GenLayer Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
