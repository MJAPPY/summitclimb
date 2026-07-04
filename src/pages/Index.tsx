import React, { useState, useEffect } from 'react';
import { GameCanvas, CosmeticSettings } from '@/components/GameCanvas';
import { WalletModal } from '@/components/WalletModal';
import { ProfilePanel } from '@/components/ProfilePanel';
import { Leaderboard } from '@/components/Leaderboard';
import { ReplayManager } from '@/components/ReplayManager';
import { AdminPanel } from '@/components/AdminPanel';
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
  AlertCircle,
  Sun,
  CloudRain,
  Mountain,
  Sparkles,
  ShieldAlert,
  Flame,
  ArrowRight
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
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Cinematic top navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-violet-950/30">
            <span className="font-black text-white text-xl tracking-tighter">S</span>
          </div>
          <div>
            <h1 className="text-md font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">SUMMIT</h1>
            <span className="text-[9px] font-bold text-indigo-400 tracking-wider block leading-none">GUY EXPEDITIONS</span>
          </div>
        </div>

        {/* Global info ticks */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wide">Active Climbers: 1,420</span>
          </div>
          <div className="font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-[11px]">
            Decay Seed: <span className="text-violet-400 font-bold">0x777...guy</span>
          </div>
        </div>

        {/* Wallet trigger & settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all animate-none"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5 text-violet-400" />}
          </button>

          <button
            onClick={() => setWalletOpen(true)}
            className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-white/10 hover:border-violet-500/30 rounded-xl px-4 py-2 text-xs flex items-center gap-2.5 shadow-lg transition-all text-left"
          >
            <Wallet className="h-4 w-4 text-violet-400" />
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Your Wallet</div>
              <div className="text-xs font-black text-white leading-none mt-1">{balance.toFixed(2)} {tokenType}</div>
            </div>
          </button>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Responsive Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 block mb-2">Navigation Panel</span>
            
            <button
              onClick={() => setActiveTab('climb')}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                activeTab === 'climb' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Compass className="h-4 w-4" /> Start Expedition
              </span>
              {activeTab === 'climb' && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">LIVE</span>}
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                activeTab === 'leaderboard' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="h-4 w-4" /> Seasons Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                activeTab === 'profile' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="h-4 w-4" /> GUY Achievements
            </button>

            <button
              onClick={() => setActiveTab('replays')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                activeTab === 'replays' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="h-4 w-4" /> Ascent Replays
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                activeTab === 'admin' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="h-4 w-4" /> Admin Controls
            </button>
          </div>

          {/* Mini active player badge */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-950 border border-white/5 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/5 rounded-full blur-md" />
            <div className="w-14 h-14 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center text-3xl shadow-inner relative">
              🧗
              <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                GUY Climber <span className="text-[10px] text-violet-400 font-mono bg-violet-500/10 px-1.5 py-0.5 rounded">Lv.{level}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Best altitude: <span className="text-emerald-400 font-black">{highestMultiplier.toFixed(2)}x</span></p>
            </div>
          </div>
        </aside>

        {/* Dynamic Display Dashboard workspace */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Standard Climb Screen and Simulation Loop */}
          {activeTab === 'climb' && (
            <div className="space-y-6">
              
              {/* Display announcement ticker banner */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/15 rounded-xl flex items-center gap-3 text-xs text-indigo-200">
                <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0" />
                <span className="font-semibold">Season 4 expedition pool active! Ascend past storm ridges and glaciers to lock in elite climber rank.</span>
              </div>

              {/* HERO VISUAL AREA: Canvas spans 100% of the workspace container */}
              <div className="space-y-4">
                <div className="relative">
                  <GameCanvas
                    multiplier={multiplier}
                    gameState={gameState}
                    cosmetics={cosmetics}
                  />

                  {/* Ultra stand-out, dramatic overlay multiplier panel */}
                  <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-white/15 px-6 py-4 rounded-2xl flex items-center gap-5 pointer-events-none shadow-2xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase flex items-center gap-1 font-mono">
                        <Flame className="h-3 w-3 text-orange-500 animate-pulse" /> CURRENT ALTITUDE
                      </span>
                      <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter mt-1">
                        {multiplier.toFixed(2)}<span className="text-violet-400 text-2xl font-black ml-0.5">x</span>
                      </div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase font-mono">EST. RECOVERED</span>
                      <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono tracking-tight mt-1.5">
                        {(betAmount * multiplier).toFixed(2)} <span className="text-xs text-slate-400 font-bold">{tokenType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highly dramatic telemetry statistics banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl">
                      <Mountain className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block leading-none">EXPEDITION SLOPE</span>
                      <div className="text-base font-black text-white mt-1 capitalize">{cosmetics.theme} slopes</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-y md:border-y-0 md:border-x border-white/5 py-3 md:py-0 md:px-4">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block leading-none">RISK ASSESSMENT</span>
                      <div className={`text-base font-black mt-1 ${
                        multiplier < 1.5 ? 'text-emerald-400' :
                        multiplier < 3.0 ? 'text-amber-400' : 'text-rose-500 animate-pulse'
                      }`}>
                        {multiplier < 1.5 ? 'SAFE ZONE' :
                         multiplier < 3.0 ? 'CREST VELOCITY' : 'WARNING: AVALANCHE BOUND'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block leading-none">PEAK ACCELERATION</span>
                      <div className="text-base font-black text-indigo-400 font-mono mt-1">
                        {Math.floor(multiplier * 18)} km/h
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTROLS AREA arranged side-by-side below the giant hero canvas */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Climber Controller Action Box */}
                <div className="md:col-span-7 p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-xs font-black text-white uppercase tracking-widest font-mono">
                      Ascent Console
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded">
                      Manual / Auto secure active
                    </span>
                  </div>

                  {/* Stake Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">Expedition Stake ({tokenType})</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          disabled={gameState === 'climbing'}
                          className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                            betAmount === amt
                              ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/20'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Cashout Multiplier Value */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">Auto Secure Altitude (Multiplier)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2.00 (optional)"
                      value={autoCashOut}
                      onChange={(e) => setAutoCashOut(e.target.value)}
                      disabled={gameState === 'climbing'}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-slate-600"
                    />
                  </div>

                  {/* Large High-Contrast Climb Trigger Action */}
                  <div className="pt-2">
                    {gameState === 'climbing' ? (
                      <button
                        onClick={handleBank}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:opacity-95 text-slate-950 font-black tracking-widest text-sm shadow-2xl shadow-emerald-950/50 transition-all flex flex-col items-center justify-center gap-1.5 animate-pulse"
                      >
                        <span className="text-xs uppercase font-black tracking-wider text-slate-900 opacity-80">SECURE HARNESS & RETREAT</span>
                        <span className="text-base font-mono font-black text-slate-950">
                          BANK NOW: {(betAmount * multiplier).toFixed(2)} {tokenType}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartClimb}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-600 to-indigo-700 hover:opacity-90 text-white font-black tracking-widest text-sm shadow-2xl shadow-violet-950/50 transition-all flex items-center justify-center gap-2 uppercase"
                      >
                        <span>LAUNCH EXPEDITION</span>
                        <ArrowUpRight className="h-5 w-5 text-violet-300" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scenic Controller Presets Box */}
                <div className="md:col-span-5 p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                  <div className="pb-3 border-b border-white/5">
                    <span className="text-xs font-black text-white uppercase tracking-widest font-mono flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" /> Climber Environment
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSceneryPreset('sunny', 'clear')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[75px] ${
                        cosmetics.theme === 'sunny' && cosmetics.weather === 'clear'
                          ? 'border-yellow-500 bg-yellow-500/10 text-white shadow-lg'
                          : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="text-xs font-black">Sunny Peak</div>
                        <div className="text-[9px] text-slate-500 leading-none mt-0.5">Clear Skies</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSceneryPreset('rain', 'rain')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[75px] ${
                        cosmetics.theme === 'rain' && cosmetics.weather === 'rain'
                          ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg'
                          : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <CloudRain className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="text-xs font-black">Storm Slabs</div>
                        <div className="text-[9px] text-slate-500 leading-none mt-0.5">Overcast Wet</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSceneryPreset('everest', 'snow')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[75px] ${
                        cosmetics.theme === 'everest' && cosmetics.weather === 'snow'
                          ? 'border-violet-500 bg-violet-500/10 text-white shadow-lg'
                          : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <Mountain className="h-4 w-4 text-violet-400" />
                      <div>
                        <div className="text-xs font-black">Swiss Alps</div>
                        <div className="text-[9px] text-slate-500 leading-none mt-0.5">Snow Twilight</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSceneryPreset('cyber', 'neonrain')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[75px] ${
                        cosmetics.theme === 'cyber' && cosmetics.weather === 'neonrain'
                          ? 'border-pink-500 bg-pink-500/10 text-white shadow-lg'
                          : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      <div>
                        <div className="text-xs font-black">Neon Ridge</div>
                        <div className="text-[9px] text-slate-500 leading-none mt-0.5">Showers</div>
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
      <footer className="mt-12 py-8 border-t border-white/5 text-center text-xs text-slate-500">
        <p className="max-w-md mx-auto">
          Summit is a simulated decentralized cryptocurrency exploration climb. All features represent mock secure models. Enjoy climbing!
        </p>
        <p className="mt-2 font-black text-slate-400 tracking-wider">CHARACTERS SUPPORTED: HERO CLIMBER GUY</p>
      </footer>
    </div>
  );
};

export default Index;