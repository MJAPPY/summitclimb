import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Award, ShieldAlert, Sparkles, Flame } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState<string>('04D : 12H : 38M : 45S');
  const participants = 1420;

  // Custom mock high-tier players representing global climbs
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { rank: 1, username: 'SUMMIT_GOAT_99', bestScore: 28.42, gamesPlayed: 85, country: '🇨🇦 CA', avatar: '🏔', prizeFraction: 25.0 },
    { rank: 2, username: 'GUY_ENJOYER_X', bestScore: 22.15, gamesPlayed: 142, country: '🇺🇸 US', avatar: '🦁', prizeFraction: 16.0 },
    { rank: 3, username: 'SATOSHI_CLIMBER', bestScore: 19.80, gamesPlayed: 94, country: '🇯🇵 JP', avatar: '⚡', prizeFraction: 12.0 },
    { rank: 4, username: 'AVALANCHE_SURF', bestScore: 15.65, gamesPlayed: 41, country: '🇫🇷 FR', avatar: '🛹', prizeFraction: 9.0 },
    { rank: 5, username: 'SHERPA_SPEED', bestScore: 12.11, gamesPlayed: 230, country: '🇳🇵 NP', avatar: '🧗', prizeFraction: 7.0 },
    { rank: 6, username: 'CRYPTO_PEAK', bestScore: 10.45, gamesPlayed: 75, country: '🇩🇪 DE', avatar: '🪙', prizeFraction: 6.0 },
    { rank: 7, username: 'FROSTY_TROLL', bestScore: 9.80, gamesPlayed: 54, country: '🇳🇴 NO', avatar: '👹', prizeFraction: 5.0 },
    { rank: 8, username: 'ZERO_DEGREE', bestScore: 8.75, gamesPlayed: 32, country: '🇨🇭 CH', avatar: '❄', prizeFraction: 4.0 },
    { rank: 9, username: 'SUMMIT_HERO_7', bestScore: 8.20, gamesPlayed: 110, country: '🇬🇧 GB', avatar: '🚀', prizeFraction: 3.5 },
    { rank: 10, username: 'GUY_POWER_777', bestScore: 7.95, gamesPlayed: 60, country: '🇦🇺 AU', avatar: '🌟', prizeFraction: 3.0 },
    { rank: 11, username: 'ALPINE_ECHO', bestScore: 7.42, gamesPlayed: 48, country: '🇦🇹 AT', avatar: '🐐', prizeFraction: 2.5 },
    { rank: 12, username: 'GLACIER_GLIDE', bestScore: 6.85, gamesPlayed: 39, country: '🇳🇿 NZ', avatar: '🦅', prizeFraction: 2.0 },
    { rank: 13, username: 'SUMMIT_SEEKER', bestScore: 6.10, gamesPlayed: 52, country: '🇮🇹 IT', avatar: '🌲', prizeFraction: 2.0 },
    { rank: 14, username: 'YODEL_MASTER', bestScore: 5.92, gamesPlayed: 66, country: '🇨🇭 CH', avatar: '🎺', prizeFraction: 1.5 },
    { rank: 15, username: 'FROSTBITE_GUY', bestScore: 5.40, gamesPlayed: 29, country: '🇸🇪 SE', avatar: '🧤', prizeFraction: 1.5 },
  ]);

  // Simulate subtle real-time updates to keep the board alive
  useEffect(() => {
    const timer = setInterval(() => {
      setCompetitors(prev => {
        const indexToTweak = Math.floor(Math.random() * (prev.length - 3)) + 3; // tweak mid-low ranks
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
            const decayPercentages = [25.0, 16.0, 12.0, 9.0, 7.0, 6.0, 5.0, 4.0, 3.5, 3.0, 2.5, 2.0, 2.0, 1.5, 1.5];
            return {
              ...c,
              rank: idx + 1,
              prizeFraction: decayPercentages[idx] || 0
            };
          });
        });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 crt-screen">
      {/* 90s Style Dynamic Stats Marquee Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Arcade Pot Card */}
        <div className="p-6 bg-slate-950 border-4 border-cyan-500 rounded-none relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_60%)]">
          <span className="text-[10px] font-retro text-cyan-400 tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" /> TOTAL BANKED POT
          </span>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-retro font-black text-white leading-none text-gradient-neon">{prizePool.toLocaleString()}</span>
            <span className="text-xs font-retro text-cyan-400 ml-1">XPR</span>
          </div>
          <div className="text-[8px] font-retro text-slate-400 mt-3 uppercase leading-normal">
            95% redistributed to top climbers
          </div>
        </div>

        {/* 90s Countdown Marquee */}
        <div className="p-6 bg-slate-950 border-4 border-pink-500 rounded-none relative overflow-hidden shadow-[0_0_20px_rgba(236,72,153,0.4)] bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_60%)]">
          <span className="text-[10px] font-retro text-pink-400 tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-pink-500" /> TIME TO RESET
          </span>
          <div className="text-xl font-retro font-black text-yellow-400 mt-4 tracking-widest text-shadow-gold">
            {timeLeft}
          </div>
          <div className="text-[8px] font-retro text-slate-400 mt-3 uppercase leading-normal">
            WEEKLY TOURNAMENT SUNDAY SYNC
          </div>
        </div>

        {/* Contenders Box */}
        <div className="p-6 bg-slate-950 border-4 border-yellow-400 rounded-none relative overflow-hidden shadow-[0_0_20px_rgba(250,204,21,0.4)] bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.15),transparent_60%)]">
          <span className="text-[10px] font-retro text-yellow-400 tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-yellow-400" /> CONTENDERS
          </span>
          <div className="text-2xl font-retro font-black text-white mt-4 leading-none">
            {participants.toLocaleString()} <span className="text-[10px] font-retro text-yellow-400">GUYS</span>
          </div>
          <div className="text-[8px] font-retro text-slate-400 mt-3 uppercase leading-normal">
            Min. 1.50x secures score entry
          </div>
        </div>
      </div>

      {/* Cyberpunk Arcade Board Header */}
      <div className="bg-slate-950 border-4 border-pink-500 rounded-none p-6 relative shadow-[0_0_30px_rgba(236,72,153,0.5)]">
        
        {/* Subtle decorative retro corner brackets */}
        <div className="absolute top-2 left-2 text-pink-500 font-retro text-xs select-none">[+]</div>
        <div className="absolute top-2 right-2 text-pink-500 font-retro text-xs select-none">[+]</div>
        <div className="absolute bottom-2 left-2 text-pink-500 font-retro text-xs select-none">[+]</div>
        <div className="absolute bottom-2 right-2 text-pink-500 font-retro text-xs select-none">[+]</div>

        <div className="flex flex-col items-center justify-center text-center py-4 border-b-2 border-dashed border-pink-500/40 mb-6">
          <h3 className="text-sm md:text-lg font-retro text-gradient-neon tracking-wider uppercase mb-2">
            🏆 HIGH SCORE CABINET LEDGER 🏆
          </h3>
          <span className="text-[8px] md:text-[10px] font-retro text-cyan-400 tracking-[0.2em] uppercase blink-fast mt-1">
            INSERT COIN TO CHALLENGE THE APEX • PLAY TO WIN
          </span>
        </div>

        <div className="overflow-x-auto rounded-none">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-4 border-pink-500 text-pink-400 text-[10px] font-retro uppercase tracking-wider bg-slate-900/90 shadow-[0_4px_10px_rgba(236,72,153,0.2)]">
                <th className="py-4 px-3 text-center w-20">Rank</th>
                <th className="py-4 px-4">Climber Profile</th>
                <th className="py-4 px-4 text-center">Location</th>
                <th className="py-4 px-4 text-right">Runs</th>
                <th className="py-4 px-4 text-right text-yellow-400">Apex Altitude</th>
                <th className="py-4 px-5 text-right text-cyan-400">Est. Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-retro text-xs bg-slate-950/40">
              {competitors.map((player) => {
                const prizeValue = (player.prizeFraction / 100) * prizePool;
                
                // Classic 90s neon badges for top ranks
                const isTopThree = player.rank <= 3;
                
                const rankStyle = 
                  player.rank === 1 ? 'border-4 border-yellow-400 bg-slate-950 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse' :
                  player.rank === 2 ? 'border-4 border-slate-300 bg-slate-950 text-slate-200 shadow-[0_0_15px_rgba(226,232,240,0.5)]' :
                  player.rank === 3 ? 'border-4 border-orange-500 bg-slate-950 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]' :
                  'border-2 border-pink-500/40 text-pink-400/80 bg-slate-950';

                return (
                  <tr
                    key={player.username}
                    className="hover:bg-pink-500/10 hover:shadow-[inset_0_0_15px_rgba(236,72,153,0.2)] transition-all group"
                  >
                    {/* Rank indicator */}
                    <td className="py-4 px-3">
                      <div className="flex justify-center">
                        <span className={`w-10 h-10 flex items-center justify-center text-xs font-black font-retro tracking-tighter ${rankStyle}`}>
                          {player.rank.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </td>

                    {/* Username & Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl p-2 bg-slate-900 border-2 border-pink-500/30 rounded-none leading-none select-none shadow-[0_0_8px_rgba(236,72,153,0.1)] group-hover:scale-110 transition-transform">
                          {player.avatar}
                        </span>
                        <div>
                          <span className={`font-black text-white group-hover:text-cyan-400 transition-colors text-xs tracking-wide ${isTopThree ? 'text-gradient-neon' : ''}`}>
                            {player.username}
                          </span>
                          {isTopThree && (
                            <span className="text-[7px] font-retro font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400 px-1.5 py-0.5 ml-2 uppercase animate-pulse">
                              1ST CLAN
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location Flag */}
                    <td className="py-4 px-4 text-center text-[10px] text-slate-300 font-mono tracking-tight group-hover:text-pink-400">
                      {player.country}
                    </td>

                    {/* Total Runs */}
                    <td className="py-4 px-4 text-right text-[10px] text-slate-400 font-mono tracking-wider">
                      {player.gamesPlayed.toString().padStart(3, '0')} <span className="text-[8px] text-pink-500/60 font-retro">COINS</span>
                    </td>

                    {/* Apex Altitude Score */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-extrabold text-white font-mono bg-slate-900 border-2 border-yellow-400/50 px-3 py-1 text-xs shadow-[0_0_10px_rgba(250,204,21,0.25)] group-hover:border-yellow-400">
                        {player.bestScore.toFixed(2)}x
                      </span>
                    </td>

                    {/* Estimated Payout */}
                    <td className="py-4 px-5 text-right">
                      <div className="font-black text-cyan-400 text-xs font-retro tracking-tighter text-gradient-neon">
                        {prizeValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} XPR
                      </div>
                      <div className="text-[8px] text-slate-500 mt-1 font-retro uppercase">
                        ({player.prizeFraction}% POT)
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