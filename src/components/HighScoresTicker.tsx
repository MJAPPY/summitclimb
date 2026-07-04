"use client";

import React from 'react';
import { Trophy, Flame, TrendingUp } from 'lucide-react';

interface HighScore {
  username: string;
  multiplier: number;
  token: string;
  payout: number;
  avatar: string;
}

export const HighScoresTicker: React.FC = () => {
  const highScores: HighScore[] = [
    { username: 'SummitGoat_99', multiplier: 28.42, token: 'CLIMB', payout: 2842, avatar: '🏔' },
    { username: 'GUY_Enjoyer_X', multiplier: 22.15, token: 'CLIMB', payout: 2215, avatar: '🦁' },
    { username: 'SatoshiClimber', multiplier: 19.80, token: 'USDT', payout: 1980, avatar: '⚡' },
    { username: 'AvalancheSurfer', multiplier: 15.65, token: 'CLIMB', payout: 1565, avatar: '🛹' },
    { username: 'SherpaSpeed', multiplier: 12.11, token: 'XPR', payout: 1211, avatar: '🧗' },
    { username: 'CryptoPeak', multiplier: 10.45, token: 'CLIMB', payout: 1045, avatar: '🪙' },
  ];

  // Duplicate items to ensure smooth continuous marquee effect
  const tickerItems = [...highScores, ...highScores];

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden py-3 px-4 shadow-lg flex items-center gap-4">
      {/* Absolute Left Sticky Header */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 shadow-md z-10">
        <Trophy className="h-4 w-4 animate-bounce" />
        <span>Live Apex Runs</span>
      </div>

      {/* Scrolling Marquee Container */}
      <div className="relative flex-1 overflow-hidden select-none">
        {/* Soft fading overlays for cinematic depth */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-10 items-center animate-[marquee_25s_linear_infinite] whitespace-nowrap w-max hover:[animation-play-state:paused] cursor-pointer">
          {tickerItems.map((score, index) => (
            <div key={index} className="inline-flex items-center gap-2.5 text-sm text-slate-300 font-semibold bg-slate-950/40 border border-white/5 py-1 px-3 rounded-lg hover:border-amber-400/30 hover:bg-slate-950 transition-all duration-300">
              <span className="text-base select-none">{score.avatar}</span>
              <span className="text-white font-bold">{score.username}</span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-extrabold font-mono">
                {score.multiplier.toFixed(2)}x <Flame className="h-3 w-3 text-amber-400 fill-amber-400" />
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-indigo-400 font-black font-mono">
                +{score.payout.toLocaleString()} <span className="text-[10px] text-slate-500">{score.token}</span>
              </span>
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