import React from 'react';
import { Award, Zap, Compass, Trophy, Share2, Clipboard, ChevronRight, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  xpReward: number;
  icon: string;
}

interface ProfilePanelProps {
  level: number;
  xp: number;
  lifetimeGames: number;
  highestMultiplier: number;
  weeklyBest: number;
  referrals: number;
  onOpenReplays: () => void;
  walletAddress?: string;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  level,
  xp,
  lifetimeGames,
  highestMultiplier,
  weeklyBest,
  referrals,
  onOpenReplays,
  walletAddress
}) => {
  const { toast } = useToast();
  const nextLevelXp = level * 100;
  const xpPercent = Math.min(100, (xp / nextLevelXp) * 100);
  const activeUserRef = walletAddress || 'anonymous';

  // Simulated static achievements list
  const achievements: Achievement[] = [
    { id: 'first-climb', title: 'First Climb', desc: 'Step onto the snowy summit slopes once.', unlocked: true, xpReward: 50, icon: '🏔' },
    { id: '5x-club', title: '5x Altitude Club', desc: 'Successfully bank any multiplier above 5.00x.', unlocked: highestMultiplier >= 5, xpReward: 100, icon: '⚡' },
    { id: '10x-club', title: 'Double Digit Ascent', desc: 'Secure a bank of 10.00x or larger.', unlocked: highestMultiplier >= 10, xpReward: 250, icon: '🔥' },
    { id: 'goat', title: 'Mountain Goat', desc: 'Climb a cumulative total of over 50 games.', unlocked: lifetimeGames >= 50, xpReward: 300, icon: '🐐' },
    { id: 'legend', title: 'Summit Legend', desc: 'Secure a bank of over 20.00x multiplier.', unlocked: highestMultiplier >= 20, xpReward: 500, icon: '👑' },
  ];

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://summit.game/ref/${activeUserRef}`);
    toast({
      title: "Referral Copied",
      description: "Share this link with your clan to earn 15% deposit bonuses!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with character badge & leveling card */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Level badge */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Circular glow outer ring */}
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-md" />
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center border-2 border-white/20 text-3xl font-black text-white shadow-xl">
              {level}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
              LEVEL
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Elite CLIMB Climber</h2>
            <p className="text-xs text-slate-400 mt-1">XP Progress to level {level + 1}</p>
            {/* Level Bar */}
            <div className="w-48 mt-2">
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>{xp} XP</span>
                <span>{nextLevelXp} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Lifetime statistics */}
        <div className="grid grid-cols-2 gap-3 border-y md:border-y-0 md:border-x border-white/5 py-4 md:py-0 md:px-6">
          <div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">LIFETIME GAMES</div>
            <div className="text-xl font-black text-white mt-1">{lifetimeGames} Runs</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">MAX MULTIPLIER</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{highestMultiplier.toFixed(2)}x</div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">WEEKLY BEST</div>
            <div className="text-xl font-black text-violet-400 mt-1">{weeklyBest.toFixed(2)}x</div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">CLAN REFERRALS</div>
            <div className="text-xl font-black text-indigo-400 mt-1">{referrals} Users</div>
          </div>
        </div>

        {/* Action Button: Referrals link copy */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300">Invite & Earn Bonuses</span>
          <div className="flex bg-slate-950/80 border border-white/10 rounded-xl p-2 items-center justify-between">
            <div className="text-xs text-slate-400 font-mono overflow-hidden whitespace-nowrap text-ellipsis pr-2">
              summit.game/ref/{activeUserRef}
            </div>
            <button
              onClick={handleCopyReferral}
              className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg transition-all shrink-0"
              title="Copy link"
            >
              <Clipboard className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Recruit friends to earn 15% lifetime bonus of all their secure banks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* achievements section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="h-4 w-4 text-yellow-400" /> Climber Achievements
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.unlocked
                    ? 'border-white/10 bg-slate-900/40'
                    : 'border-white/5 bg-slate-950/20 opacity-60'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="text-3xl p-1 bg-white/5 rounded-lg leading-none select-none">
                    {item.unlocked ? item.icon : '🔒'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1">
                      {item.title}
                      {item.unlocked && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">{item.desc}</p>
                    <div className="text-[10px] text-indigo-400 font-bold mt-2">+{item.xpReward} XP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* win history logs / watch replies quick link */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-indigo-400" /> Recent Climbs log
          </h3>

          <div className="space-y-2">
            {[
              { multiplier: 4.82, result: 'banked', score: 482, date: '1 hour ago' },
              { multiplier: 12.43, result: 'collapsed', score: 0, date: '3 hours ago' },
              { multiplier: 1.95, result: 'banked', score: 195, date: 'Yesterday' },
            ].map((run, index) => (
              <div
                key={index}
                className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">Climb {index + 1}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{run.date}</div>
                </div>
                <div className="text-right">
                  <div className={`font-black ${run.result === 'banked' ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {run.multiplier.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {run.result === 'banked' ? `Earned +${run.score} coins` : 'Collapsed'}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={onOpenReplays}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold p-3 rounded-xl border border-white/5 text-xs transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Play className="h-3.5 w-3.5 text-violet-400" /> View Detailed Replay Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};