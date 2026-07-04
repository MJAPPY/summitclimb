import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, ArrowUpRight, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface Competitor {
  rank: number;
  username: string;
  bestScore: number;
  gamesPlayed: number;
  country: string;
  avatar: string;
  prizeFraction: number; // percentage of the pot
}

interface LeaderboardProps {
  prizePool: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ prizePool }) => {
  const [timeLeft, setTimeLeft] = useState<string>('04d : 12h : 38m : 45s');
  const participants = 1420;

  // Custom mock high-tier players representing global climbs
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { rank: 1, username: 'SummitGoat_99', bestScore: 28.42, gamesPlayed: 85, country: '🇨🇦 CA', avatar: '🏔', prizeFraction: 25.0 },
    { rank: 2, username: 'GUY_Enjoyer_X', bestScore: 22.15, gamesPlayed: 142, country: '🇺🇸 US', avatar: '🦁', prizeFraction: 16.0 },
    { rank: 3, username: 'SatoshiClimber', bestScore: 19.80, gamesPlayed: 94, country: '🇯🇵 JP', avatar: '⚡', prizeFraction: 12.0 },
    { rank: 4, username: 'AvalancheSurfer', bestScore: 15.65, gamesPlayed: 41, country: '🇫🇷 FR', avatar: '🛹', prizeFraction: 9.0 },
    { rank: 5, username: 'SherpaSpeed', bestScore: 12.11, gamesPlayed: 230, country: '🇳🇵 NP', avatar: '🧗', prizeFraction: 7.0 },
    { rank: 6, username: 'CryptoPeak', bestScore: 10.45, gamesPlayed: 75, country: '🇩🇪 DE', avatar: '🪙', prizeFraction: 6.0 },
    { rank: 7, username: 'FrostyTroll', bestScore: 9.80, gamesPlayed: 54, country: '🇳🇴 NO', avatar: '👹', prizeFraction: 5.0 },
    { rank: 8, username: 'ZeroDegreeClimb', bestScore: 8.75, gamesPlayed: 32, country: '🇨🇭 CH', avatar: '❄', prizeFraction: 4.0 },
    { rank: 9, username: 'SevenSummitHero', bestScore: 8.20, gamesPlayed: 110, country: '🇬🇧 GB', avatar: '🚀', prizeFraction: 3.5 },
    { rank: 10, username: 'GuyPower_777', bestScore: 7.95, gamesPlayed: 60, country: '🇦🇺 AU', avatar: '🌟', prizeFraction: 3.0 },
    { rank: 11, username: 'AlpineEcho', bestScore: 7.42, gamesPlayed: 48, country: '🇦🇹 AT', avatar: '🐐', prizeFraction: 2.5 },
    { rank: 12, username: 'GlacierGlide', bestScore: 6.85, gamesPlayed: 39, country: '🇳🇿 NZ', avatar: '🦅', prizeFraction: 2.0 },
    { rank: 13, username: 'SummitSeeker_1', bestScore: 6.10, gamesPlayed: 52, country: '🇮🇹 IT', avatar: '🌲', prizeFraction: 2.0 },
    { rank: 14, username: 'YodelMaster', bestScore: 5.92, gamesPlayed: 66, country: '🇨🇭 CH', avatar: '🎺', prizeFraction: 1.5 },
    { rank: 15, username: 'Frostbite_GUY', bestScore: 5.40, gamesPlayed: 29, country: '🇸🇪 SE', avatar: '🧤', prizeFraction: 1.5 },
  ]);

  // Simulate subtle real-time updates to keep the board alive
  useEffect(() => {
    const timer = setInterval(() => {
      // Pick a random competitor and tweak their score slightly
      setCompetitors(prev => {
        const indexToTweak = Math.floor(Math.random() * (prev.length - 3)) + 3; // don't easily change top 3
        return prev.map((c, idx) => {
          if (idx === indexToTweak) {
            const extraScore = parseFloat((Math.random() * 0.15).toFixed(2));
            return {
              ...c,
              bestScore: parseFloat((c.bestScore + extraScore).toFixed(2)),
              gamesPlayed: c.gamesPlayed + 1
            };
          }
          return c;
        }).sort((a, b) => b.bestScore - a.bestScore)
          .map((c, idx) => {
            // Keep the corresponding decay percentage assigned to the current ranking position
            const decayPercentages = [25.0, 16.0, 12.0, 9.0, 7.0, 6.0, 5.0, 4.0, 3.5, 3.0, 2.5, 2.0, 2.0, 1.5, 1.5];
            return {
              ...c,
              rank: idx + 1,
              prizeFraction: decayPercentages[idx] || 0
            };
          });
        });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Dynamic Interactive Prize pool header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pool Stat card */}
        <div className="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-500/30 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Trophy className="h-32 w-32 text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-indigo-400 tracking-wider flex items-center gap-1.5 font-retro">
            <Sparkles className="h-4 w-4 animate-spin text-yellow-400" /> GRAND PRIZE POOL
          </span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-4xl font-black text-white font-mono tracking-tight">{prizePool.toLocaleString()}</span>
            <span className="text-sm font-bold text-indigo-300">XPR</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Directly distributed to top 15 climbers at Sunday reset.
          </p>
        </div>

        {/* Countdown card */}
        <div className="p-6 bg-slate-900/90 border-2 border-pink-500/30 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute -right-6 -bottom-6 opacity-10 font-mono text-9xl font-black text-slate-700 select-none pointer-events-none">
            ⏳
          </div>
          <span className="text-xs font-bold text-pink-400 tracking-wider flex items-center gap-1.5 font-retro">
            <Clock className="h-4 w-4 text-pink-500" /> SEASON COUNTDOWN
          </span>
          <div className="text-2xl font-black text-white tracking-widest font-mono mt-3.5">
            {timeLeft}
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Resets automatically every Sunday at 00:00 UTC.
          </p>
        </div>

        {/* Participants card */}
        <div className="p-6 bg-slate-900/90 border-2 border-cyan-500/30 rounded-2xl relative overflow-hidden shadow-xl">
          <span className="text-xs font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 font-retro">
            <Users className="h-4 w-4 text-cyan-400" /> TOTAL CONTENDERS
          </span>
          <div className="text-3xl font-black text-white mt-3 font-mono">
            {participants.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Any run locked above 1.50x secures a spot on our live board.
          </p>
        </div>
      </div>

      {/* Prize Distributions configure guidelines */}
      <div className="p-5 bg-gradient-to-r from-violet-950/40 to-slate-950 border-2 border-violet-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-violet-400 shrink-0" />
          <div className="text-xs text-slate-200 leading-normal">
            Weekly pool covers 95% of total go stakes, with <span className="font-extrabold text-violet-300">@tripseven retaining a 5% system operator distribution fee.</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="text-[10px] bg-slate-950 border border-violet-500/30 px-3 py-1.5 rounded-lg text-slate-200 font-mono font-bold shadow-sm">1st (25%)</span>
          <span className="text-[10px] bg-slate-950 border border-violet-500/30 px-3 py-1.5 rounded-lg text-slate-200 font-mono font-bold shadow-sm">2nd (16%)</span>
          <span className="text-[10px] bg-slate-950 border border-violet-500/30 px-3 py-1.5 rounded-lg text-slate-200 font-mono font-bold shadow-sm">3rd (12%)</span>
        </div>
      </div>

      {/* Leaderboard Table list */}
      <div className="bg-slate-950/90 border-2 border-pink-500/30 rounded-2xl p-6 overflow-hidden shadow-2xl">
        <h3 className="text-xs font-retro text-pink-400 uppercase tracking-widest mb-6 flex items-center gap-2.5">
          <Award className="h-5 w-5 text-yellow-500 animate-pulse" /> HIGH ALTITUDE CABINET LEDGER
        </h3>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider font-mono bg-slate-900/60">
                <th className="py-4 px-3 text-center w-16">Rank</th>
                <th className="py-4 px-4">Climber Profile</th>
                <th className="py-4 px-4 text-center">Location</th>
                <th className="py-4 px-4 text-right">Runs Completed</th>
                <th className="py-4 px-4 text-right">Apex Altitude</th>
                <th className="py-4 px-5 text-right text-indigo-400">Est. Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {competitors.map((player) => {
                const prizeValue = (player.prizeFraction / 100) * prizePool;
                
                // Styling ranks dynamically with colorful badges
                const isTopThree = player.rank <= 3;
                const rankBadgeClass = 
                  player.rank === 1 ? 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 ring-2 ring-yellow-300' :
                  player.rank === 2 ? 'bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-950 ring-2 ring-slate-300' :
                  player.rank === 3 ? 'bg-gradient-to-tr from-amber-600 to-orange-700 text-white ring-2 ring-orange-500' :
                  'bg-slate-900 border border-white/10 text-slate-300';

                return (
                  <tr
                    key={player.username}
                    className="hover:bg-violet-950/15 transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex justify-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono shadow ${rankBadgeClass}`}>
                          {player.rank}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-slate-900/80 rounded-xl leading-none select-none border border-white/5 shadow-sm group-hover:scale-110 transition-transform">
                          {player.avatar}
                        </span>
                        <div>
                          <span className="text-white font-bold group-hover:text-pink-400 transition-colors text-sm">
                            {player.username}
                          </span>
                          {isTopThree && (
                            <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded ml-2 uppercase tracking-wider font-mono">
                              Elite
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-300">
                      {player.country}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {player.gamesPlayed} <span className="text-[10px] text-slate-500">runs</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-white font-mono bg-slate-900/60 px-3 py-1 rounded-lg border border-white/5">
                        {player.bestScore.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="font-black text-indigo-400 font-mono text-sm">
                        {prizeValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} XPR
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        ({player.prizeFraction}% share)
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;