import React from 'react';
import { Trophy, Star, ShieldAlert, Award, Zap, Coins, ArrowRight } from 'lucide-react';

interface RunSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: 'banked' | 'collapsed';
  multiplier: number;
  xpEarned: number;
  level: number;
  xp: number;
  remainingGoes: number;
}

export const RunSummaryModal: React.FC<RunSummaryModalProps> = ({
  isOpen,
  onClose,
  result,
  multiplier,
  xpEarned,
  level,
  xp,
  remainingGoes
}) => {
  if (!isOpen) return null;

  const nextLevelXp = level * 100;
  const xpPercent = Math.min(100, (xp / nextLevelXp) * 100);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-950 border-4 border-pink-500 rounded-none max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.4)] relative p-6 space-y-6 crt-screen">
        
        {/* Corner Retro Markers */}
        <div className="absolute top-2 left-2 text-pink-500 font-retro text-xs select-none">[+]</div>
        <div className="absolute top-2 right-2 text-pink-500 font-retro text-xs select-none">[+]</div>
        
        {/* Dynamic Headers */}
        <div className="text-center space-y-2 border-b-2 border-dashed border-pink-500/30 pb-4">
          {result === 'banked' ? (
            <>
              <div className="inline-flex p-3 bg-green-500/10 border-2 border-green-500 text-green-400 rounded-none animate-bounce">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-retro text-gradient-neon tracking-wide uppercase">
                ALTITUDE SECURED!
              </h2>
              <p className="text-[10px] font-retro text-green-400 uppercase tracking-wider">
                Successfully locked before avalanche
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex p-3 bg-rose-500/10 border-2 border-rose-500 text-rose-500 rounded-none animate-pulse">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-retro text-rose-500 tracking-wide uppercase">
                CRASH COLLAPSED
              </h2>
              <p className="text-[10px] font-retro text-slate-400 uppercase tracking-wider">
                The mountain peak has collapsed
              </p>
            </>
          )}
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border-2 border-white/5 p-4 text-center">
            <span className="text-[8px] font-retro text-slate-400 uppercase block mb-1">ALTITUDE APEX</span>
            <div className={`text-2xl font-retro font-black ${result === 'banked' ? 'text-green-400' : 'text-rose-500'}`}>
              {multiplier.toFixed(2)}x
            </div>
          </div>

          <div className="bg-slate-900 border-2 border-white/5 p-4 text-center">
            <span className="text-[8px] font-retro text-slate-400 uppercase block mb-1">XP RECEIVED</span>
            <div className="text-2xl font-retro font-black text-yellow-400">
              +{xpEarned}
            </div>
          </div>
        </div>

        {/* Player Progression Block */}
        <div className="space-y-2 bg-slate-900 border-2 border-white/5 p-4">
          <div className="flex items-center justify-between text-[9px] font-retro text-slate-300">
            <span>PLAYER LEVEL {level}</span>
            <span className="text-cyan-400">{xp} / {nextLevelXp} XP</span>
          </div>
          
          <div className="w-full bg-slate-950 h-3 rounded-none overflow-hidden border border-white/10 p-0.5">
            <div
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 h-full transition-all duration-1000"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          
          <span className="text-[8px] text-slate-500 font-retro uppercase block text-center pt-1">
            {nextLevelXp - xp} XP needed to reach next tier level
          </span>
        </div>

        {/* Arcade Call to Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-retro text-xs border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase shadow-[4px_4px_0px_#ec4899]"
        >
          <span>CONTINUE EXPEDITION</span>
          <ArrowRight className="h-4 w-4 stroke-[3px]" />
        </button>

      </div>
    </div>
  );
};