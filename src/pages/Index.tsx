import React, { useState, useEffect } from 'react';
import { GameCanvas, CosmeticSettings } from '@/components/GameCanvas';
import { WalletModal } from '@/components/WalletModal';
import { ProfilePanel } from '@/components/ProfilePanel';
import { Leaderboard } from '@/components/Leaderboard';
import { ReplayManager } from '@/components/ReplayManager';
import { AdminPanel } from '@/components/AdminPanel';
import { SummitLogo } from '@/components/SummitLogo';
import { HighScoresTicker } from '@/components/HighScoresTicker';
import { audioSynth } from '@/utils/audio';
import { useToast } from '@/hooks/use-toast';
import { 
  Compass, 
  Volume2, 
  VolumeX, 
  Wallet, 
  User, 
  Trophy, 
  Settings, 
  History, 
  ArrowUpRight,
  Sun,
  CloudRain,
  Mountain,
  Sparkles,
  ShieldAlert,
  Flame
} from 'lucide-react';

const Index = () => {
  const { toast } = useToast();

  // Navigation state (removed 'shop')
  const [activeTab, setActiveTab] = useState<'climb' | 'leaderboard' | 'profile' | 'replays' | 'admin'>('climb');
  const [walletOpen, setWalletOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Currency & Player progression states
  const [balance, setBalance] = useState<number>(350);
  const [tokenType, setTokenType] = useState<'CLIMB' | 'USDT' | 'XPR'>('CLIMB');
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(45);

  // Stats
  const [lifetimeGames, setLifetimeGames] = useState<number>(12);
  const [highestMultiplier, setHighestMultiplier] = useState<number>(4.82);
  const [weeklyBest, setWeeklyBest] = useState<number>(4.82);

  // Active climb mechanics state
  const [gameState, setGameState] = useState<'idle' | 'climbing' | 'banked' | 'collapsed'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashOut, setAutoCashOut] = useState<string>('');

  // Hidden crash point calculation (simulating server-side cryptographically secure random value)
  const [hiddenCollapsePoint, setHiddenCollapsePoint] = useState<number>(0);

  // Cosmetics control (with new theme + weather configuration options)
  const [cosmetics, setCosmetics] = useState<CosmeticSettings>({
    climber: 'standard',
    theme: 'everest',
    weather: 'snow',
    flag: 'summit',
    trail: 'none'
  });

  // Toggle sound
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSynth.setMute(nextMuted);
  };

  // Start ascending summit climb
  const handleStartClimb = () => {
    if (gameState === 'climbing') return;
    if (balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "Deposit more tokens using the wallet interface above.",
        variant: "destructive"
      });
      return;
    }

    // Deduct bet amount
    setBalance(prev => prev - betAmount);
    setMultiplier(1.00);
    setGameState('climbing');

    // Generate random secure collapse point (e.g. anywhere between 1.05 and 25.00)
    const randSeed = Math.random();
    let calculatedCollapse = 1.01;
    if (randSeed > 0.05) {
      calculatedCollapse = parseFloat((1.01 + Math.pow(Math.random() * 4.8, 1.8)).toFixed(2));
    }
    setHiddenCollapsePoint(calculatedCollapse);

    // Audio triggers
    audioSynth.startWind();
    audioSynth.playHeartbeat(1.00);
    audioSynth.startYodelMusic(); // Start synthesized Swiss polka yodelling sequence!

    toast({
      title: "Climb Initiated",
      description: `Bet of ${betAmount} ${tokenType} committed. GUY is climbing!`,
    });
  };

  // Safe Cash out bank triggers
  const handleBank = () => {
    if (gameState !== 'climbing') return;
    setGameState('banked');

    audioSynth.stopHeartbeat();
    audioSynth.stopYodelMusic(); // Stop the yodel sequence
    audioSynth.playBankSound();

    const winnings = betAmount * multiplier;
    setBalance(prev => prev + winnings);

    // Progression XP reward calculations
    const xpEarned = Math.floor(multiplier * 15);
    setXp(prev => {
      const nextXp = prev + xpEarned;
      const threshold = level * 100;
      if (nextXp >= threshold) {
        setLevel(l => l + 1);
        toast({
          title: "🚀 LEVEL UP!",
          description: `You reached Level ${level + 1}! Claiming bonus gear.`,
        });
        return nextXp - threshold;
      }
      return nextXp;
    });

    setLifetimeGames(prev => prev + 1);

    if (multiplier > highestMultiplier) {
      setHighestMultiplier(multiplier);
      setWeeklyBest(multiplier);
    }

    toast({
      title: "Bank Secured!",
      description: `Winnings: ${winnings.toFixed(2)} ${tokenType}. Earned +${xpEarned} XP.`,
    });
  };

  // Game step interval
  useEffect(() => {
    let interval: any = null;
    if (gameState === 'climbing') {
      let speedStep = 0.01;
      interval = setInterval(() => {
        setMultiplier((prev) => {
          // Accelerate growth speed over time
          const growthFactor = 1 + (prev - 1) * 0.12;
          const nextVal = parseFloat((prev + speedStep * growthFactor).toFixed(2));

          // Update real-time sound frequencies
          audioSynth.updateWindIntensity(nextVal);
          audioSynth.playHeartbeat(nextVal);

          // Auto-cashout trigger
          const autoVal = parseFloat(autoCashOut);
          if (!isNaN(autoVal) && autoVal > 1.01 && nextVal >= autoVal) {
            handleBank();
            clearInterval(interval);
            return autoVal;
          }

          // Check for collapse / crash point
          if (nextVal >= hiddenCollapsePoint) {
            setGameState('collapsed');
            setLifetimeGames(prev => prev + 1);
            audioSynth.stopHeartbeat();
            audioSynth.stopYodelMusic(); // Stop the yodel sequence
            audioSynth.playCollapseSound();
            toast({
              title: "Mountain Collapsed!",
              description: `A severe avalanche occurred at ${hiddenCollapsePoint.toFixed(2)}x. Climb failed.`,
              variant: "destructive"
            });
            clearInterval(interval);
            return hiddenCollapsePoint;
          }

          return nextVal;
        });
      }, 50);
    }

    return () => clearInterval(interval);
  }, [gameState, hiddenCollapsePoint, autoCashOut, betAmount, tokenType]);

  // Utility to easily preset Scenery settings
  const handleSceneryPreset = (
    theme: 'everest' | 'sunny' | 'rain' | 'cyber' | 'volcanic' | 'cosmic',
    weather: 'clear' | 'snow' | 'rain' | 'storm' | 'blizzard' | 'neonrain'
  ) => {
    setCosmetics(prev => ({
      ...prev,
      theme,
      weather
    }));
    toast({
      title: "Scenery Dispatched",
      description: `Scenic atmospheric theme changed to ${theme} with ${weather} weather!`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Cinematic top navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b-2 border-slate-700/80 px-5 lg:px-10 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          {/* Direct, clean SummitLogo without box borders or glow wraps */}
          <SummitLogo size="sm" className="shrink-0" />
          <div>
            <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 uppercase">
              GUYS Summit
            </h1>
            <span className="text-xs font-black text-amber-400 tracking-wider block leading-none mt-1 uppercase">
              climb the pinnacle
            </span>
          </div>
        </div>

        {/* Global info ticks */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse border-2 border-emerald-950" />
            <span className="font-extrabold tracking-wide">Active Climbers: 1,420</span>
          </div>
          <div className="font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border-2 border-slate-800 text-xs">
            Decay Seed: <span className="text-amber-400 font-extrabold">0x777...guy</span>
          </div>
        </div>

        {/* Wallet trigger & settings */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-xl border-2 border-slate-600 shadow transition-all"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-amber-400" />}
          </button>

          <button
            onClick={() => setWalletOpen(true)}
            className="bg-gradient-to-b from-slate-850 to-slate-950 border-2 border-slate-600 hover:border-slate-400 rounded-xl px-5 py-2.5 text-sm flex items-center gap-3.5 shadow-xl transition-all text-left"
          >
            <Wallet className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Your Wallet</div>
              <div className="text-sm font-black text-slate-100 leading-none mt-1.5">{balance.toFixed(2)} {tokenType}</div>
            </div>
          </button>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Responsive Sidebar Navigation - Enlarged with Metallicus style */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 space-y-2.5 shadow-2xl">
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest px-3 block mb-3 border-b-2 border-slate-800 pb-1">
              Navigation Hub
            </span>
            
            <button
              onClick={() => setActiveTab('climb')}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border-2 ${
                activeTab === 'climb' 
                  ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-slate-400 text-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <Compass className={`h-5 w-5 ${activeTab === 'climb' ? 'text-amber-400' : ''}`} /> Start Expedition
              </span>
              {activeTab === 'climb' && <span className="text-[11px] bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded font-mono font-black animate-pulse">LIVE</span>}
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border-2 ${
                activeTab === 'leaderboard' 
                  ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-slate-400 text-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Trophy className={`h-5 w-5 ${activeTab === 'leaderboard' ? 'text-amber-400' : ''}`} /> Seasons Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border-2 ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-slate-400 text-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <User className={`h-5 w-5 ${activeTab === 'profile' ? 'text-amber-400' : ''}`} /> GUY Achievements
            </button>

            <button
              onClick={() => setActiveTab('replays')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border-2 ${
                activeTab === 'replays' 
                  ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-slate-400 text-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <History className={`h-5 w-5 ${activeTab === 'replays' ? 'text-amber-400' : ''}`} /> Ascent Replays
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border-2 ${
                activeTab === 'admin' 
                  ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-slate-400 text-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Settings className={`h-5 w-5 ${activeTab === 'admin' ? 'text-amber-400' : ''}`} /> Admin Controls
            </button>
          </div>

          {/* Mini active player badge - Metallicus themed */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 rounded-2xl p-5 flex items-center gap-4.5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl" />
            <div className="w-16 h-16 bg-slate-900 border-2 border-slate-700 rounded-xl flex items-center justify-center text-4xl shadow-inner relative">
              🧗
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <div>
              <div className="text-base font-black text-slate-100 flex items-center gap-1.5">
                GUY Climber <span className="text-xs text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded">Lv.{level}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">Best altitude: <span className="text-emerald-400 font-black text-sm">{highestMultiplier.toFixed(2)}x</span></p>
            </div>
          </div>
        </aside>

        {/* Dynamic Display Dashboard workspace */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* Standard Climb Screen and Simulation Loop */}
          {activeTab === 'climb' && (
            <div className="space-y-8">
              
              {/* Dynamic scrolling High Scores ticker */}
              <HighScoresTicker />

              {/* HERO VISUAL AREA: Canvas spans 100% of the workspace container */}
              <div className="space-y-6">
                <div className="relative">
                  <GameCanvas
                    multiplier={multiplier}
                    gameState={gameState}
                    cosmetics={cosmetics}
                  />

                  {/* Ultra stand-out, dramatic overlay multiplier panel */}
                  <div className="absolute bottom-8 left-8 bg-slate-900/95 backdrop-blur-md border-2 border-slate-600 px-8 py-5 rounded-2xl flex items-center gap-6 pointer-events-none shadow-2xl">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-amber-400 font-black tracking-widest uppercase flex items-center gap-1.5 font-mono">
                        <Flame className="h-4 w-4 text-amber-400 animate-pulse" /> CURRENT ALTITUDE
                      </span>
                      <div className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter mt-1">
                        {multiplier.toFixed(2)}<span className="text-amber-400 text-3xl font-black ml-0.5">x</span>
                      </div>
                    </div>
                    <div className="h-14 w-[2px] bg-slate-700" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 font-black tracking-widest uppercase font-mono">EST. RECOVERED</span>
                      <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tight mt-1.5">
                        {(betAmount * multiplier).toFixed(2)} <span className="text-xs text-slate-400 font-bold">{tokenType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highly dramatic telemetry statistics banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-slate-800 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl">
                      <Mountain className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-mono font-black block leading-none">EXPEDITION SLOPE</span>
                      <div className="text-lg font-black text-white mt-1.5 capitalize">{cosmetics.theme} slopes</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-y md:border-y-0 md:border-x-2 border-slate-800 py-4 md:py-0 md:px-6">
                    <div className="p-4 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl">
                      <Sparkles className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-mono font-black block leading-none">RISK ASSESSMENT</span>
                      <div className={`text-lg font-black mt-1.5 ${
                        multiplier < 1.5 ? 'text-emerald-400' :
                        multiplier < 3.0 ? 'text-amber-400' : 'text-rose-500 animate-pulse'
                      }`}>
                        {multiplier < 1.5 ? 'SAFE ZONE' :
                         multiplier < 3.0 ? 'CREST VELOCITY' : 'WARNING: AVALANCHE BOUND'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl">
                      <ShieldAlert className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-mono font-black block leading-none">PEAK ACCELERATION</span>
                      <div className="text-lg font-black text-amber-400 font-mono mt-1.5">
                        {Math.floor(multiplier * 18)} km/h
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTROLS AREA arranged side-by-side below the giant hero canvas */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Climber Controller Action Box */}
                <div className="md:col-span-7 p-7 bg-slate-900 border-2 border-slate-700 rounded-2xl space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-800">
                    <span className="text-sm font-black text-white uppercase tracking-widest font-mono">
                      Ascent Console
                    </span>
                    <span className="text-[11px] text-amber-400 font-mono bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 font-black">
                      MANUAL / AUTO ACTIVE
                    </span>
                  </div>

                  {/* Stake Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">Expedition Stake ({tokenType})</label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          disabled={gameState === 'climbing'}
                          className={`py-3.5 rounded-xl text-sm font-black transition-all border-2 ${
                            betAmount === amt
                              ? 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-slate-400 text-slate-100 shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Cashout Multiplier Value */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">Auto Secure Altitude (Multiplier)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2.00 (optional)"
                      value={autoCashOut}
                      onChange={(e) => setAutoCashOut(e.target.value)}
                      disabled={gameState === 'climbing'}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-slate-500 placeholder-slate-600"
                    />
                  </div>

                  {/* Large High-Contrast Climb Trigger Action */}
                  <div className="pt-3">
                    {gameState === 'climbing' ? (
                      <button
                        onClick={handleBank}
                        className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 hover:opacity-95 text-slate-950 font-black tracking-widest text-base shadow-2xl border-2 border-emerald-300 transition-all flex flex-col items-center justify-center gap-2 animate-pulse"
                      >
                        <span className="text-xs uppercase font-black tracking-widest text-slate-900 opacity-90">SECURE HARNESS & RETREAT</span>
                        <span className="text-lg font-mono font-black text-slate-950">
                          BANK NOW: {(betAmount * multiplier).toFixed(2)} {tokenType}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartClimb}
                        className="w-full py-6 rounded-2xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 hover:from-slate-650 hover:to-slate-850 text-slate-100 font-black tracking-widest text-base shadow-2xl border-2 border-slate-500 transition-all flex items-center justify-center gap-3 uppercase"
                      >
                        <span>LAUNCH EXPEDITION</span>
                        <ArrowUpRight className="h-6 w-6 text-amber-400 animate-pulse" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scenic Controller Presets Box */}
                <div className="md:col-span-5 p-7 bg-slate-900 border-2 border-slate-700 rounded-2xl space-y-5 shadow-2xl">
                  <div className="pb-3.5 border-b-2 border-slate-800">
                    <span className="text-sm font-black text-white uppercase tracking-widest font-mono flex items-center gap-2.5">
                      <Sparkles className="h-5 w-5 text-amber-400" /> Climber Environment
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSceneryPreset('sunny', 'clear')}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'sunny' && cosmetics.weather === 'clear'
                          ? 'border-slate-400 bg-slate-800 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <Sun className="h-5 w-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-black">Sunny Peak</div>
                        <div className="text-[10px] text-slate-500 leading-none mt-1">Clear Skies</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSceneryPreset('rain', 'rain')}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'rain' && cosmetics.weather === 'rain'
                          ? 'border-slate-400 bg-slate-800 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <CloudRain className="h-5 w-5 text-slate-300" />
                      <div>
                        <div className="text-xs font-black">Storm Slabs</div>
                        <div className="text-[10px] text-slate-500 leading-none mt-1">Overcast Wet</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSceneryPreset('everest', 'snow')}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'everest' && cosmetics.weather === 'snow'
                          ? 'border-slate-400 bg-slate-800 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <Mountain className="h-5 w-5 text-slate-300" />
                      <div>
                        <div className="text-xs font-black">Swiss Alps</div>
                        <div className="text-[10px] text-slate-500 leading-none mt-1">Snow Twilight</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSceneryPreset('cyber', 'neonrain')}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'cyber' && cosmetics.weather === 'neonrain'
                          ? 'border-slate-400 bg-slate-800 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <Sparkles className="h-5 w-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-black">Neon Ridge</div>
                        <div className="text-[10px] text-slate-500 leading-none mt-1">Showers</div>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Other displays mapping onto corresponding navigation menus */}
          {activeTab === 'leaderboard' && <Leaderboard />}

          {activeTab === 'profile' && (
            <ProfilePanel
              level={level}
              xp={xp}
              lifetimeGames={lifetimeGames}
              highestMultiplier={highestMultiplier}
              weeklyBest={weeklyBest}
              referrals={4}
              onOpenReplays={() => setActiveTab('replays')}
            />
          )}

          {activeTab === 'replays' && <ReplayManager />}

          {activeTab === 'admin' && <AdminPanel />}

        </main>
      </div>

      {/* Wallet balance modal drawer overlays */}
      {walletOpen && (
        <WalletModal
          onClose={() => setWalletOpen(false)}
          balance={balance}
          setBalance={setBalance}
          tokenType={tokenType}
          setTokenType={setTokenType}
        />
      )}

      {/* Aesthetic bottom footer disclaimer */}
      <footer className="mt-12 py-10 border-t-2 border-slate-800 text-center text-xs text-slate-500 space-y-6">
        {/* Large reflective gold logo centerpiece - rendered directly on page */}
        <SummitLogo size="lg" className="mx-auto" />
        <div>
          <p className="max-w-md mx-auto font-medium text-slate-400">
            Summit is a simulated decentralized cryptocurrency exploration climb. All features represent mock secure models. Enjoy climbing!
          </p>
          <p className="mt-3 font-black text-amber-400 tracking-wider text-sm uppercase">
            CHARACTERS SUPPORTED: HERO CLIMBER GUY
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;