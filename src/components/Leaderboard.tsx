import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, ArrowUpRight, Award, ShieldAlert } from 'lucide-react';

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
        <div className="p-5 bg-gradient-to-br from-indigo-950/80 to-slate-950 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Trophy className="h-32 w-32 text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-indigo-400 tracking-wider">WEEKLY PRIZE POOL</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-white">{prizePool.toLocaleString()}</span>
            <span className="text-xs font-bold text-indigo-300">XPR</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Distributed to Top 15 climbers when the countdown ends.</p>
        </div>

        {/* Countdown card */}
        <div className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 font-mono text-9xl font-black text-slate-700 select-none pointer-events-none">
            ⏳
          </div>
          <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-violet-400" /> SEASON 4 COUNTDOWN
          </span>
          <div className="text-2xl font-black text-white tracking-widest font-mono mt-2.5">
            {timeLeft}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Resets every Sunday at 00:00 UTC.</p>
        </div>

        {/* Participants card */}
        <div className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-400" /> ACTIVE COMPETITORS
          </span>
          <div className="text-3xl font-black text-white mt-2">
            {participants.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Every bank above 1.5x earns passive tickets into seasonal raffles.</p>
        </div>
      </div>

      {/* Prize Distributions configure guidelines */}
      <div className="p-4 bg-violet-950/20 border border-violet-500/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-violet-400" />
          <div className="text-xs text-slate-300">
            Current pool represents 95% of total goes purchased, with <span className="font-bold text-violet-300">@tripseven retaining a 5% distribution fee.</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="text-[10px] bg-slate-950 border border-white/5 px-2 py-1 rounded text-slate-400 font-mono">1st (25%)</span>
          <span className="text-[10px] bg-slate-950 border border-white/5 px-2 py-1 rounded text-slate-400 font-mono">2nd (16%)</span>
          <span className="text-[10px] bg-slate-950 border border-white/5 px-2 py-1 rounded text-slate-400 font-mono">3rd (12%)</span>
          <span className="text-[10px] bg-slate-950 border border-white/5 px-2 py-1 rounded text-slate-400 font-mono">Others (remaining top 15)</span>
        </div>
      </div>

      {/* Leaderboard Table list */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 overflow-hidden shadow-xl">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" /> Top Altitude Leaderboard (95% Prize Split)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">
                <th className="py-3 px-2">Rank</th>
                <th className="py-3 px-4">Climber</th>
                <th className="py-3 px-4 text-center">Country</th>
                <th className="py-3 px-4 text-right">Runs</th>
                <th className="py-3 px-4 text-right">Best Score</th>
                <th className="py-3 px-4 text-right text-indigo-400">Est. Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {competitors.map((player) => {
                const prizeValue = (player.prizeFraction / 100) * prizePool;
                return (
                  <tr
                    key={player.username}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3 px-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        player.rank === 1 ? 'bg-yellow-500 text-slate-950' :
                        player.rank === 2 ? 'bg-slate-300 text-slate-950' :
                        player.rank === 3 ? 'bg-amber-600 text-slate-950' : 'bg-slate-950 border border-white/5 text-slate-400'
                      }`}>
                        {player.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 bg-white/5 rounded-md leading-none select-none">
                          {player.avatar}
                        </span>
                        <div>
                          <span className="text-white font-bold group-hover:text-indigo-400 transition-colors">
                            {player.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-300">
                      {player.country}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {player.gamesPlayed}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-white font-mono">
                      {player.bestScore.toFixed(2)}x
                    </td>
                    <td className="py-3 px-4 text-right font-black text-indigo-400 font-mono">
                      {prizeValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} XPR
                      <span className="text-[10px] text-slate-500 block font-normal leading-none mt-1">({player.prizeFraction}%)</span>
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