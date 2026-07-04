"use client";

import React from 'react';
import { Trophy, Flame, ShieldAlert, Cpu } from 'lucide-react';

export const HighScoresTicker: React.FC = () => {
  // Mock scores are completely reset to empty to guarantee starting clean
  const highScores: any[] = [];

  // System status alerts to show instead when no active runs exist
  const systemAlerts = [
    "SYSTEM STATUS: ACTIVE",
    "AWAITING COMPLETED ASCENTS ABOVE 1.50x TO RECORD RUNS",
    "STAKE PORTAL LINKED",
    "CABINET LEDGER SYNCED",
    "INSERT COIN TO START YOUR EXPEDITION"
  ];

  // Duplicate items for fluid infinite scrolling marquee effect
  const tickerItems = [...systemAlerts, ...systemAlerts];

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden py-3 px-4 shadow-lg flex items-center gap-4">
      {/* Absolute Left Sticky Header */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 shadow-md z-10 font-retro">
        <Cpu className="h-4 w-4 animate-spin" style={{ animationDuration: '6s' }} />
        <span>LIVE FEED</span>
      </div>

      {/* Scrolling Marquee Container */}
      <div className="relative flex-1 overflow-hidden select-none">
        {/* Soft fading overlays for cinematic depth */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-10 items-center animate-[marquee_25s_linear_infinite] whitespace-nowrap w-max hover:[animation-play-state:paused] cursor-pointer">
          {tickerItems.map((alert, index) => (
            <div key={index} className="inline-flex items-center gap-2.5 text-xs text-cyan-400 font-bold font-retro tracking-wider bg-slate-950/40 border border-white/5 py-1 px-3 rounded-lg hover:border-cyan-400/30 hover:bg-slate-950 transition-all duration-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Style element for custom slide animation to guarantee fluid marquee movement across screens */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default HighScoresTicker;