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
  const [timeLeft, setTimeLeft] = useState<string>('07D : 00H : 00M : 00S');
  const [participants, setParticipants] = useState<number>(142);
  
  // Real high score mock contenders
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { rank: 1, username: 'cyber_goat', bestScore: 24.50, gamesPlayed: 148, country: 'AUT', avatar: '', prizeFraction: 40 },
    { rank: 2, username: 'tripseven', bestScore: 18.92, gamesPlayed: 84, country: 'USA', avatar: '', prizeFraction: 25 },
    { rank: 3, username: 'snow_shredder', bestScore: 14.11, gamesPlayed: 120, country: 'SUI', avatar: '', prizeFraction: 15 },
    { rank: 4, username: 'yodel_king', bestScore: 9.35, gamesPlayed: 56, country: 'GER', avatar: '', prizeFraction: 8 },
    { rank: 5, username: 'peak_chaser', bestScore: 7.20, gamesPlayed: 92, country: 'CAN', avatar: '', prizeFraction: 5 },
  ]);

  // Live countdown calculating precise duration to upcoming Sunday 00:00 UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextSunday = new Date();
      
      // Calculate days to next Sunday
      const currentDay = now.getUTCDay();
      const daysRemaining = currentDay === 0 ? 7 : 7 - currentDay;
      
      nextSunday.setUTCDate(now.getUTCDate() + daysRemaining);
      nextSunday.setUTCHours(0, 0, 0, 0);

      const msDiff = nextSunday.getTime() - now.getTime();
      
      if (msDiff <= 0) {
        setTimeLeft('00D : 00H : 00M : 00S');
        return;
      }

      const totalSecs = Math.floor(msDiff / 1000);
      const days = Math.floor(totalSecs / (3600 * 24));
      const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      setTimeLeft(
        `${days.toString().padStart(2, '0')}D : ${hours.toString().padStart(2, '0')}H : ${mins.toString().padStart(2, '0')}M : ${secs.toString().padStart(2, '0')}S`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
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
            93% redistributed to top climbers
          </div>
        </div>

        {/* 90s Countdown Marquee */}
        <div className="p-6 bg-slate-950 border-4 border-pink-500 rounded-none relative overflow-hidden shadow-[0_0_20px_rgba(236,72,153,0.4)] bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_60%)]">
          <span className="text-[10px] font-retro text-pink-400 tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-pink-500" /> TIME TO RESET
          </span>
          <div className="text-lg md:text-xl font-retro font-black text-yellow-400 mt-4 tracking-widest text-shadow-gold">
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
          {competitors.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <Trophy className="h-12 w-12 text-yellow-400 mx-auto animate-bounce" />
              <div className="font-retro text-sm text-white tracking-wider">NO CLIMBERS ON THE BOARD YET</div>
              <p className="text-[10px] font-retro text-slate-400 uppercase tracking-widest leading-relaxed">
                Insert a coin and successfully lock a multiplier above 1.50x to carve your clan initials into the screen!
              </p>
            </div>
          ) : (
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
                      <td className="py-4 px-3">
                        <div className="flex justify-center">
                          <span className={`w-10 h-10 flex items-center justify-center text-xs font-black font-retro tracking-tighter ${rankStyle}`}>
                            {player.rank.toString().padStart(2, '0')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
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
                      <td className="py-4 px-4 text-center text-[10px] text-slate-300 font-mono tracking-tight group-hover:text-pink-400">
                        {player.country}
                      </td>
                      <td className="py-4 px-4 text-right text-[10px] text-slate-400 font-mono tracking-wider">
                        {player.gamesPlayed.toString().padStart(3, '0')} <span className="text-[8px] text-pink-500/60 font-retro">COINS</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-white font-mono bg-slate-900 border-2 border-yellow-400/50 px-3 py-1 text-xs shadow-[0_0_10px_rgba(250,204,21,0.25)] group-hover:border-yellow-400">
                          {player.bestScore.toFixed(2)}x
                        </span>
                      </td>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;