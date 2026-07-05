"use client";

import React, { useEffect, useState } from 'react';
import { Cpu, Trophy, Sparkles } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export const HighScoresTicker: React.FC = () => {
  const [tickerItems, setTickerItems] = useState<string[]>([
    "SYSTEM STATUS: ACTIVE",
    "AWAITING COMPLETED ASCENTS ABOVE 1.50x TO RECORD RUNS",
    "STAKE PORTAL LINKED",
    "CABINET LEDGER SYNCED",
    "INSERT COIN TO START YOUR EXPEDITION"
  ]);

  useEffect(() => {
    const fetchLiveScores = async () => {
      try {
        const { data, error } = await supabase
          .from('climber_leaderboard')
          .select('wallet_address, score, games_played, country')
          .order('score', { ascending: false })
          .limit(8);

        if (error) {
          console.error("Live feed fetch error:", error);
          return;
        }

        if (data && data.length > 0) {
          // Construct high-energy dynamic ticker statements out of the actual live database scores
          const feeds = data.map((row, idx) => {
            const prefix = idx === 0 ? "🏆 APEX CLIMBER" : idx < 3 ? "⭐ ELITE RUN" : "🧗 CLIMB";
            return `${prefix}: @${row.wallet_address} REACHED ${parseFloat(row.score).toFixed(2)}x (${row.country})`;
          });

          // Mix in a few global system status checks to keep the aesthetic intact
          const mixedFeeds = [
            ...feeds,
            "SYSTEM STATUS: ONLINE",
            "LEDGER SYNCHRONIZED SECURELY",
            "NEXT GRAND PAYOUT SCHEDULED FOR MONDAY 7:00 AM UTC"
          ];

          setTickerItems(mixedFeeds);
        }
      } catch (err) {
        console.warn("Could not load real-time ticker data:", err);
      }
    };

    fetchLiveScores();

    // Set up real-time polling to update the ticker every 10 seconds
    const interval = setInterval(fetchLiveScores, 10000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate items for fluid infinite scrolling marquee effect
  const scrollingItems = [...tickerItems, ...tickerItems];

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
          {scrollingItems.map((alert, index) => {
            const isTrophy = alert.includes("🏆") || alert.includes("APEX");
            const isElite = alert.includes("⭐") || alert.includes("ELITE");
            
            let colorClass = "text-cyan-400";
            if (isTrophy) colorClass = "text-yellow-400 font-extrabold";
            else if (isElite) colorClass = "text-pink-400 font-semibold";

            return (
              <div 
                key={index} 
                className={`inline-flex items-center gap-2.5 text-xs ${colorClass} font-retro tracking-wider bg-slate-950/40 border border-white/5 py-1 px-3 rounded-lg hover:border-cyan-400/30 hover:bg-slate-950 transition-all duration-300`}
              >
                <span className={`w-2 h-2 rounded-full ${isTrophy ? 'bg-yellow-400' : isElite ? 'bg-pink-500' : 'bg-emerald-500'} animate-pulse`} />
                <span>{alert}</span>
              </div>
            );
          })}
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