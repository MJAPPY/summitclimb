"use client";

import React from 'react';
import { Award, Zap, Compass, Trophy, Share2, Clipboard, ChevronRight, Play, Star, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CosmeticSettings } from './GameCanvas';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  xpReward: number;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

interface ProfilePanelProps {
  level: number;
  xp: number;
  lifetimeGames: number;
  highestMultiplier: number;
  weeklyBest: number;
  referrals: number;
  walletAddress?: string;
  cosmetics: CosmeticSettings;
  setCosmetics: React.Dispatch<React.SetStateAction<CosmeticSettings>>;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  level,
  xp,
  lifetimeGames,
  highestMultiplier,
  weeklyBest,
  referrals,
  walletAddress,
  cosmetics,
  setCosmetics
}) => {
  const { toast } = useToast();
  const nextLevelXp = level * 100;
  const xpPercent = Math.min(100, (xp / nextLevelXp) * 100);
  const activeUserRef = walletAddress || 'anonymous';

  // Custom high-fidelity Achievements lists with color coded rarity tiers
  const achievements: Achievement[] = [
    { id: 'first-climb', title: 'FIRST STEP', desc: 'Step onto the snowy summit slopes once.', unlocked: true, xpReward: 50, icon: '🏔️', rarity: 'Common' },
    { id: '5x-club', title: 'ALTITUDE CLUB', desc: 'Successfully bank any multiplier above 5.00x.', unlocked: highestMultiplier >= 5, xpReward: 100, icon: '⚡', rarity: 'Rare' },
    { id: '10x-club', title: 'DOUBLE DIGIT', desc: 'Secure a bank of 10.00x or larger.', unlocked: highestMultiplier >= 10, xpReward: 250, icon: '🔥', rarity: 'Epic' },
    { id: 'goat', title: 'MOUNTAIN GOAT', desc: 'Climb a cumulative total of over 50 games.', unlocked: lifetimeGames >= 50, xpReward: 300, icon: '🐐', rarity: 'Epic' },
    { id: 'legend', title: 'SUMMIT LEGEND', desc: 'Secure a bank of over 20.00x multiplier.', unlocked: highestMultiplier >= 20, xpReward: 500, icon: '👑', rarity: 'Legendary' },
  ];

  // Definitive Level Unlock list for Climber skins, Particle Trails, and Banners
  const rewardsList = [
    { type: 'climber', value: 'standard', name: 'Standard Climber', levelReq: 1, desc: 'Your trusty starting red parka', icon: '🧗' },
    { type: 'trail', value: 'rainbow', name: 'Rainbow Trail', levelReq: 2, desc: 'Hyperspace particle trail', icon: '🌈' },
    { type: 'climber', value: 'neon', name: 'Neon Pink Climber', levelReq: 3, desc: 'Synthetic high-vis cyberpunk suit', icon: '👾' },
    { type: 'trail', value: 'fire', name: 'Volcanic Flame Trail', levelReq: 4, desc: 'Fierce trail of crackling embers', icon: '🔥' },
    { type: 'climber', value: 'gold', name: 'Solid Gold Climber', levelReq: 5, desc: 'Pure luxurious golden space gear', icon: '👑' },
    { type: 'trail', value: 'gold', name: 'Glittering Gold Trail', levelReq: 6, desc: 'A rich shimmering path of gold dust', icon: '✨' },
    { type: 'climber', value: 'astro', name: 'Nebula Astronaut', levelReq: 8, desc: 'High-altitude deep space suit', icon: '👨‍🚀' },
  ];

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://summit.game/ref/${activeUserRef}`);
    toast({
      title: "Referral Link Copied",
      description: "Recruit your squad to secure 15% deposit bonuses!",
    });
  };

  const equipItem = (type: 'climber' | 'trail', value: any, itemName: string) => {
    setCosmetics(prev => ({
      ...prev,
      [type]: value
    }));
    toast({
      title: "Gear Equipped",
      description: `Successfully geared up with the ${itemName}!`,
    });
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Epic': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Rare': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 crt-screen">
      
      {/* Dynamic Profile Hub & Stats Board */}
      <div className="bg-slate-950 border-4 border-pink-500 rounded-none p-6 shadow-[0_0_20px_rgba(236,72,153,0.35)] relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_65%)]">
        
        {/* Corner Retro Markers */}
        <div className="absolute top-2 left-2 text-pink-500 font-retro text-[8px] select-none">[PROFILE_ENG]</div>
        <div className="absolute top-2 right-2 text-pink-500 font-retro text-[8px] select-none">[SYS_OK]</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-3">
          
          {/* Circular Retro Level Badge */}
          <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-dashed border-pink-500/30 pb-6 lg:pb-0 lg:pr-6">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-md animate-pulse" />
              <div className="w-24 h-24 bg-slate-950 border-4 border-pink-500 rounded-full flex flex-col items-center justify-center relative z-10 shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                <span className="text-[10px] font-retro text-pink-400 leading-none">LVL</span>
                <span className="text-4xl font-retro font-black text-white mt-1 leading-none">{level}</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-950 font-retro text-[8px] px-2.5 py-0.5 border border-black uppercase font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                CLIMBER
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-sm font-retro text-white tracking-wide leading-tight">
                ELITE CLIMBER
              </h2>
              <p className="text-[9px] font-retro text-cyan-400 uppercase tracking-wider">
                XP progress to Level {level + 1}
              </p>
              
              {/* Retro XP Progress Bar */}
              <div className="w-full sm:w-56">
                <div className="w-full bg-slate-900 h-4 border-2 border-pink-500 rounded-none p-0.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 h-full"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-retro text-slate-400 mt-1">
                  <span>{xp} XP</span>
                  <span>{nextLevelXp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Multi-Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-b lg:border-b-0 lg:border-r border-dashed border-pink-500/30 pb-6 lg:pb-0 lg:pr-6">
            <div className="bg-slate-900/60 border border-white/5 p-3 relative group hover:border-cyan-400/30 transition-colors">
              <span className="text-[8px] font-retro text-slate-400 uppercase block leading-none">LIFETIME RUNS</span>
              <span className="text-sm font-retro font-black text-white block mt-2 text-gradient-neon">{lifetimeGames} Runs</span>
            </div>

            <div className="bg-slate-900/60 border border-white/5 p-3 relative group hover:border-yellow-400/30 transition-colors">
              <span className="text-[8px] font-retro text-slate-400 uppercase block leading-none">MAX ALTITUDE</span>
              <span className="text-sm font-retro font-black text-emerald-400 block mt-2">{highestMultiplier.toFixed(2)}x</span>
            </div>

            <div className="bg-slate-900/60 border border-white/5 p-3 relative group hover:border-purple-400/30 transition-colors">
              <span className="text-[8px] font-retro text-slate-400 uppercase block leading-none">WEEKLY BEST</span>
              <span className="text-sm font-retro font-black text-purple-400 block mt-2">{weeklyBest.toFixed(2)}x</span>
            </div>

            <div className="bg-slate-900/60 border border-white/5 p-3 relative group hover:border-pink-400/30 transition-colors">
              <span className="text-[8px] font-retro text-slate-400 uppercase block leading-none">CLAN CO-OP</span>
              <span className="text-sm font-retro font-black text-pink-400 block mt-2">{referrals} Users</span>
            </div>
          </div>

          {/* Share & Invite Module */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] font-retro text-yellow-400 uppercase block tracking-wider">
              🤝 RECRUIT COMPANIONS
            </span>
            <p className="text-[9px] font-retro text-slate-400 leading-normal uppercase">
              Earn 15% life commission of all secure banks from recruited climbers.
            </p>
            <div className="flex bg-slate-950 border-2 border-pink-500 p-1.5 justify-between items-center">
              <span className="text-[9px] text-pink-400 font-mono overflow-hidden whitespace-nowrap text-ellipsis pr-2 select-all uppercase">
                summit.game/ref/{activeUserRef}
              </span>
              <button
                onClick={handleCopyReferral}
                className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-retro text-[10px] px-3.5 py-1.5 transition-colors cursor-pointer"
                title="Copy Invite Link"
              >
                COPY
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Level Wardrobe & Cosmetics Selector Console */}
      <div className="arcade-panel p-6 space-y-4">
        <h3 className="text-xs md:text-sm font-retro text-gradient-neon uppercase tracking-wider flex items-center gap-2 pb-3 border-b-2 border-dashed border-pink-500/30">
          <Sparkles className="h-4 w-4 text-pink-500 animate-pulse" /> COSMETICS WARDROBE
        </h3>
        <p className="text-[10px] font-retro text-slate-400 leading-normal uppercase pb-2">
          Gain XP to level up your climber and unlock high-altitude cosmetic upgrades. Customize your look on the mountainside!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rewardsList.map((item, index) => {
            const isUnlocked = level >= item.levelReq;
            const isCurrentlyEquipped = cosmetics[item.type as 'climber' | 'trail'] === item.value;

            return (
              <div 
                key={index} 
                className={`p-4 border-2 flex flex-col justify-between transition-all rounded-none relative overflow-hidden ${
                  isUnlocked 
                    ? isCurrentlyEquipped 
                      ? 'border-green-500 bg-green-500/5' 
                      : 'border-pink-500/30 bg-slate-900/40 hover:border-pink-500/60'
                    : 'border-white/5 bg-slate-950/25 opacity-40'
                }`}
              >
                {/* Level Lock Overlay Indicator */}
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[8px] font-retro px-2 py-0.5">
                    LOCK L. {item.levelReq}
                  </div>
                )}
                {isUnlocked && isCurrentlyEquipped && (
                  <div className="absolute top-2 right-2 bg-green-500/10 border border-green-500 text-green-400 text-[8px] font-retro px-2 py-0.5 flex items-center gap-1">
                    <Check className="h-2 w-2" /> EQUIPPED
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-3xl select-none leading-none pt-1">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-retro text-[10px] text-white tracking-wide">
                      {item.name}
                    </h4>
                    <p className="text-[8px] font-retro text-slate-400 leading-relaxed uppercase mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  {isUnlocked ? (
                    <button
                      onClick={() => equipItem(item.type as 'climber' | 'trail', item.value, item.name)}
                      disabled={isCurrentlyEquipped}
                      className={`w-full py-2 font-retro text-[9px] uppercase transition-all rounded-none ${
                        isCurrentlyEquipped 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default'
                          : 'bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold cursor-pointer'
                      }`}
                    >
                      {isCurrentlyEquipped ? 'ACTIVE GEAR' : 'EQUIP GEAR'}
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-950 border border-white/5 text-slate-600 font-retro text-[9px] text-center uppercase cursor-default">
                      Level {item.levelReq} Required
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main achievements & Climbs Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Achievements list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-pink-500/30">
            <h3 className="text-xs md:text-sm font-retro text-gradient-neon uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-pink-500 animate-pulse" /> CLIMBER ACHIEVEMENTS
            </h3>
            <span className="text-[10px] font-retro text-cyan-400 uppercase bg-cyan-400/10 px-2 py-0.5 border border-cyan-500/20">
              {achievements.filter(a => a.unlocked).length} / {achievements.length} UNLOCKED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={`border-2 p-4 relative group transition-all rounded-none ${
                  item.unlocked
                    ? 'border-pink-500/50 bg-slate-950/60 shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:border-pink-500'
                    : 'border-white/5 bg-slate-950/20 opacity-55'
                }`}
              >
                {/* Rarity Tag */}
                <span className={`absolute top-2 right-2 text-[7px] font-retro border px-1.5 py-0.5 uppercase tracking-widest ${getRarityStyle(item.rarity)}`}>
                  {item.rarity}
                </span>

                <div className="flex gap-4 items-start pt-2">
                  <div className="text-3xl p-2.5 bg-slate-900 border border-white/10 select-none leading-none shrink-0">
                    {item.unlocked ? item.icon : '🔒'}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-retro text-[10px] text-white tracking-wide truncate">
                      {item.title}
                    </h4>
                    <p className="text-[9px] font-retro text-slate-400 leading-relaxed uppercase">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[8px] font-retro text-yellow-400 font-bold">
                        +{item.xpReward} XP
                      </span>
                      {item.unlocked && (
                        <span className="text-[8px] font-retro text-green-400 bg-green-400/10 px-1.5 rounded-none font-bold uppercase">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History tape Quick Link */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs md:text-sm font-retro text-gradient-neon uppercase tracking-wider flex items-center gap-2 pb-3 border-b-2 border-dashed border-pink-500/30">
            <Compass className="h-4 w-4 text-pink-500" /> FLIGHT LOG RECORD
          </h3>

          <div className="space-y-3">
            {[
              { multiplier: 4.82, result: 'banked', score: 482, date: '1 HOUR AGO' },
              { multiplier: 12.43, result: 'collapsed', score: 0, date: '3 HOURS AGO' },
              { multiplier: 1.95, result: 'banked', score: 195, date: 'YESTERDAY' },
            ].map((run, index) => (
              <div
                key={index}
                className="p-3 bg-slate-950/60 border-2 border-pink-500/20 hover:border-pink-500/50 transition-colors flex items-center justify-between text-xs font-retro uppercase"
              >
                <div className="space-y-1">
                  <div className="text-white text-[10px]">CLIMB RUN {index + 1}</div>
                  <div className="text-[8px] text-slate-500 font-mono">{run.date}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className={`text-[11px] font-black ${run.result === 'banked' ? 'text-green-400' : 'text-rose-500'}`}>
                    {run.multiplier.toFixed(2)}x
                  </div>
                  <div className="text-[8px] text-slate-400 font-mono">
                    {run.result === 'banked' ? `+${run.score} PTS` : 'COLLAPSED'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};