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
import { protonService } from '@/utils/proton';
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
  Flame,
  CheckCircle2,
  Coins,
  ChevronRight,
  Gift,
  Award,
  Zap
} from 'lucide-react';

const Index = () => {
  const { toast } = useToast();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'climb' | 'leaderboard' | 'profile' | 'replays' | 'admin'>('climb');
  const [walletOpen, setWalletOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Global lifted Wallet Connection state
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Currency & Player progression states - Strictly XPR Native Token
  const [balance, setBalance] = useState<number>(350);
  const tokenType = 'XPR';
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(45);

  // Remaining climbs / goes (each climb costs exactly 1 Go)
  const [remainingGoes, setRemainingGoes] = useState<number>(5);

  // Dynamic live growing Weekly Prize Pool (increases directly as players purchase goes!)
  // Calculated dynamically as 95% of total purchases added to base pool
  const [prizePool, setPrizePool] = useState<number>(25000);

  // Stats
  const [lifetimeGames, setLifetimeGames] = useState<number>(12);
  const [highestMultiplier, setHighestMultiplier] = useState<number>(4.82);
  const [weeklyBest, setWeeklyBest] = useState<number>(4.82);

  // Active climb mechanics state
  const [gameState, setGameState] = useState<'idle' | 'climbing' | 'banked' | 'collapsed'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.00);

  // Custom bulk goes purchase custom amount state
  const [customGoesInput, setCustomGoesInput] = useState<string>('10');

  // Hidden crash point calculation
  const [hiddenCollapsePoint, setHiddenCollapsePoint] = useState<number>(0);

  // Cosmetics control
  const [cosmetics, setCosmetics] = useState<CosmeticSettings>({
    climber: 'standard',
    theme: 'everest',
    weather: 'snow',
    flag: 'summit',
    trail: 'none'
  });

  // Attempt to restore user's verified session silently when loading the app
  useEffect(() => {
    const autoLogin = async () => {
      const activeSession = await protonService.restore();
      if (activeSession) {
        setWalletAddress(activeSession.actor);
        setWalletConnected(true);
        toast({
          title: "Session Restored",
          description: `Welcome back to the Summit, @${activeSession.actor}!`,
        });
      }
    };
    autoLogin();
  }, []);

  // Toggle sound
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSynth.setMute(nextMuted);
  };

  // Bulk buy goes transaction handler
  const handleBuyGoes = async (count: number) => {
    if (count <= 0) return;

    if (balance < count) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${count} XPR to purchase ${count} goes. Deposit more tokens.`,
        variant: "destructive"
      });
      return;
    }

    // Attempt real mainnet transfer to @tripseven if wallet is connected
    if (walletConnected) {
      try {
        toast({
          title: "Sending Signature Request",
          description: "Authorize the XPR goes purchase in your WebAuth app...",
        });
        await protonService.transfer('tripseven', count, 'XPR', `Purchase ${count} climbs bundle - GUYS Summit`);
      } catch (e) {
        toast({
          title: "Transaction Failed",
          description: "Signature request was rejected by WebAuth link.",
          variant: "destructive"
        });
        return;
      }
    }

    // Process payment success (Retain 5% for developer @tripseven, send 95% directly to weekly leaderboard pot)
    const devCut = count * 0.05;
    const poolContribution = count * 0.95;

    setBalance(prev => prev - count);
    setRemainingGoes(prev => prev + count);
    setPrizePool(prev => prev + poolContribution);

    toast({
      title: "Climbs Added!",
      description: `Bought ${count} goes for ${count} XPR. Paid to @tripseven (5% retained, 95% added to Weekly Prize Pool!)`,
    });
  };

  // Start ascending summit climb (costs exactly 1 remaining go)
  const handleStartClimb = () => {
    if (gameState === 'climbing') return;

    if (remainingGoes <= 0) {
      toast({
        title: "No Goes Left",
        description: "Please buy more goes using the console on the right to start climbing!",
        variant: "destructive"
      });
      return;
    }

    // Deduct exactly 1 climb go
    setRemainingGoes(prev => prev - 1);
    
    setMultiplier(1.00);
    setGameState('climbing');

    // Generate random secure collapse point
    const randSeed = Math.random();
    let calculatedCollapse = 1.01;
    if (randSeed > 0.05) {
      calculatedCollapse = parseFloat((1.01 + Math.pow(Math.random() * 4.8, 1.8)).toFixed(2));
    }
    setHiddenCollapsePoint(calculatedCollapse);

    // Audio triggers
    audioSynth.startWind();
    audioSynth.playHeartbeat(1.00);
    audioSynth.startYodelMusic();

    toast({
      title: "Climb Initiated",
      description: "1 go consumed. Get ready to lock in before the avalanche!",
    });
  };

  // Safe Cash out bank triggers - Locks the current multiplier score for weekly payouts
  const handleBank = () => {
    if (gameState !== 'climbing') return;
    setGameState('banked');

    audioSynth.stopHeartbeat();
    audioSynth.stopYodelMusic();
    audioSynth.playBankSound();

    const lockedScore = multiplier;

    // Progression XP reward calculations based on lock-in height
    const xpEarned = Math.floor(lockedScore * 15);
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

    if (lockedScore > highestMultiplier) {
      setHighestMultiplier(lockedScore);
      setWeeklyBest(lockedScore);
    }

    toast({
      title: "Altitude Secured!",
      description: `Score of ${lockedScore.toFixed(2)}x registered into Weekly Leaderboard! Earned +${xpEarned} XP.`,
    });
  };

  // Game step interval
  useEffect(() => {
    let interval: any = null;
    if (gameState === 'climbing') {
      let speedStep = 0.01;
      interval = setInterval(() => {
        setMultiplier((prev) => {
          const growthFactor = 1 + (prev - 1) * 0.12;
          const nextVal = parseFloat((prev + speedStep * growthFactor).toFixed(2));

          audioSynth.updateWindIntensity(nextVal);
          audioSynth.playHeartbeat(nextVal);

          if (nextVal >= hiddenCollapsePoint) {
            setGameState('collapsed');
            setLifetimeGames(prev => prev + 1);
            audioSynth.stopHeartbeat();
            audioSynth.stopYodelMusic();
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
  }, [gameState, hiddenCollapsePoint]);

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

  // Launch genuine wallet connection selector dialog
  const handleConnectWallet = async () => {
    try {
      const connection = await protonService.connect();
      setWalletAddress(connection.actor);
      setWalletConnected(true);
      toast({
        title: "Proton Connected",
        description: `Successfully linked session for actor @${connection.actor}!`,
      });
    } catch (e) {
      toast({
        title: "Authentication Aborted",
        description: "Failed to establish real-world Proton wallet connection.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-yellow-500 selection:text-slate-950">
      {/* Cinematic top navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b-2 border-slate-800 px-5 lg:px-10 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <SummitLogo size="sm" className="shrink-0 rounded-2xl animate-pulse w-18 h-18" />
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase">
              GUYS <span className="text-gradient-gold">Summit</span>
            </h1>
            <span className="text-sm font-black text-amber-400 tracking-widest block leading-none mt-1.5 uppercase">
              climb the pinnacle
            </span>
          </div>
        </div>

        {/* Global info ticks */}
        <div className="hidden md:flex items-center gap-8 text-base text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse border-2 border-emerald-950" />
            <span className="font-extrabold tracking-wide uppercase text-sm">Active Climbers: 1,420</span>
          </div>
        </div>

        {/* Wallet trigger & settings with askguy.app credentials */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-xl border border-slate-700 shadow transition-all"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-yellow-400" />}
          </button>

          {walletConnected ? (
            <button
              onClick={() => setWalletOpen(true)}
              className="bg-gradient-to-r from-violet-900/20 via-slate-900 to-slate-950 border-2 border-violet-500/50 hover:border-violet-400 rounded-xl px-5 py-2.5 text-base flex items-center gap-3.5 shadow-lg shadow-violet-950/40 transition-all text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-violet-500/10 rounded-full blur-sm pointer-events-none" />
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-base border border-violet-500/30">
                🧗
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-white font-mono leading-none">@{walletAddress}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-none">
                  {balance.toFixed(2)} XPR
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-450 hover:to-amber-450 text-slate-950 font-black px-6 py-4 rounded-xl text-sm uppercase tracking-widest transition-all flex items-center gap-2 border-b-2 border-amber-600 shadow-md animate-pulse"
            >
              <Wallet className="h-4 w-4" /> Connect Proton SDK
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Responsive, highly stylized Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-300 font-black uppercase tracking-widest">
                EXPEDITION PORTAL
              </span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                Active Setup
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('climb')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all border group ${
                  activeTab === 'climb' 
                    ? 'bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-transparent border-yellow-500/30 text-white shadow-xl shadow-yellow-500/5' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Compass className={`h-5 w-5 shrink-0 ${activeTab === 'climb' ? 'text-yellow-400' : 'text-slate-500 group-hover:text-white'}`} /> 
                  <span className="truncate text-base">Launch Expedition</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all border group ${
                  activeTab === 'leaderboard' 
                    ? 'bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-transparent border-violet-500/30 text-white shadow-xl shadow-violet-500/5' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Trophy className={`h-5 w-5 shrink-0 ${activeTab === 'leaderboard' ? 'text-violet-400' : 'text-slate-500 group-hover:text-white'}`} /> 
                  <span className="truncate text-base">Leaderboards</span>
                </span>
                <span className="text-[10px] bg-violet-500/20 text-violet-300 font-mono px-2 py-0.5 rounded font-bold shrink-0">TOP 15</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all border group ${
                  activeTab === 'profile' 
                    ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30 text-white shadow-xl shadow-emerald-500/5' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <User className={`h-5 w-5 shrink-0 ${activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'}`} /> 
                  <span className="truncate text-base">Achievements</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('replays')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all border group ${
                  activeTab === 'replays' 
                    ? 'bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-transparent border-indigo-500/30 text-white shadow-xl shadow-indigo-500/5' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <History className={`h-5 w-5 shrink-0 ${activeTab === 'replays' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} /> 
                  <span className="truncate text-base">Ascent Replays</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all border group ${
                  activeTab === 'admin' 
                    ? 'bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-transparent border-rose-500/30 text-white shadow-xl shadow-rose-500/5' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Settings className={`h-5 w-5 shrink-0 ${activeTab === 'admin' ? 'text-rose-400' : 'text-slate-500 group-hover:text-white'}`} /> 
                  <span className="truncate text-base">Admin Control</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interactive Weekly pot explainer item block */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-500/20 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Gift className="h-36 w-36 text-indigo-400" />
            </div>

            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 text-sm">
                🎁
              </span>
              <span className="text-sm text-indigo-400 font-mono font-black uppercase tracking-wider">
                Weekly Jackpot Split
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">95% Pool Payoff Model</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Climb goes cost exactly 1 XPR. Bulk goes purchases fund the Weekly Prize Pool (95% distributed to Top 15 players, 5% retained by developer @tripseven).
              </p>
            </div>

            <button 
              onClick={() => setActiveTab('leaderboard')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-950/40"
            >
              See Prize Breakdowns
            </button>
          </div>

          {/* Mini active player badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-full blur-xl" />
            
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-4xl shadow-inner relative shrink-0">
              🧗
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10 leading-none">
                PRO
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-lg font-black text-white flex items-center gap-1.5 truncate">
                {walletConnected ? `@${walletAddress}` : "GUY Climber"}{" "}
                <span className="text-[11px] text-yellow-400 font-mono bg-yellow-400/10 px-1.5 py-0.5 rounded shrink-0 leading-none">Lv.{level}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1 font-semibold leading-tight">
                Best altitude: <span className="text-emerald-400 font-black">{highestMultiplier.toFixed(2)}x</span>
              </p>
            </div>
          </div>
        </aside>

        {/* Dynamic Display Dashboard workspace */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Standard Climb Screen */}
          {activeTab === 'climb' && (
            <div className="space-y-6">
              
              {/* Live Apex ticker placed at the top for real-time dynamic feel */}
              <HighScoresTicker />

              {/* Classic Crash Layout: Game on Left, Controller Console on Right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left Area: Canvas screen, COMPACT & SLEEK ACTION TRIGGER & Instant altitude details */}
                <div className="xl:col-span-8 space-y-6">
                  <GameCanvas
                    multiplier={multiplier}
                    gameState={gameState}
                    cosmetics={cosmetics}
                  />

                  {/* HIGH-IMPACT LAUNCH BUTTON: Now has tight, highly responsive vertical dimensions to fit standard layout frames */}
                  <div className="w-full">
                    {gameState === 'climbing' ? (
                      <button
                        onClick={handleBank}
                        className="w-full py-5 md:py-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-350 hover:to-emerald-500 text-slate-950 font-black tracking-widest shadow-[0_4px_30px_rgba(52,211,153,0.4)] border-4 border-emerald-300 transition-all flex flex-col items-center justify-center gap-1 animate-pulse cursor-pointer"
                      >
                        <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-slate-900 opacity-90 leading-none">SECURE SAFETY BELT</span>
                        <span className="text-2xl md:text-3xl font-mono font-black text-slate-950 leading-tight">
                          LOCK IN ALTITUDE: {multiplier.toFixed(2)}x
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartClimb}
                        className="w-full py-6 md:py-7 rounded-2xl bg-gradient-to-b from-yellow-400 via-amber-405 to-yellow-500 hover:from-yellow-350 hover:to-amber-450 text-slate-950 font-black tracking-[0.2em] shadow-[0_4px_30px_rgba(245,158,11,0.35)] border-4 border-yellow-350 transition-all flex items-center justify-center gap-3 uppercase cursor-pointer"
                      >
                        <span className="text-xl md:text-2xl tracking-widest">LAUNCH EXPEDITION</span>
                        <ArrowUpRight className="h-6 w-6 text-slate-950 stroke-[3.5px]" />
                      </button>
                    )}
                  </div>

                  {/* Altitude metrics & details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-905 border border-slate-800/80 rounded-2xl shadow-xl flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-yellow-400 font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                          <Flame className="h-5 w-5 text-yellow-400 animate-pulse" /> ALTITUDE
                        </span>
                        <div className="text-4xl font-black text-white font-mono tracking-tighter mt-1">
                          {multiplier.toFixed(2)}<span className="text-yellow-400 text-2xl font-black ml-0.5">x</span>
                        </div>
                      </div>
                      <div className="h-12 w-[1px] bg-slate-800" />
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-slate-400 font-black tracking-wider uppercase font-mono">RUN SCORE STATUS</span>
                        <div className="text-2xl font-black text-indigo-400 font-mono tracking-tight mt-1">
                          {multiplier.toFixed(2)} <span className="text-xs text-slate-400 font-bold font-sans">Locked</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl shadow-xl">
                      <div className="flex items-center gap-3">
                        <Mountain className="h-6 w-6 text-yellow-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[11px] text-slate-400 uppercase font-mono font-black block leading-none">SLOPE</span>
                          <span className="text-sm font-bold text-white block mt-1 truncate capitalize">{cosmetics.theme}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-l border-slate-850 pl-4">
                        <ShieldAlert className="h-6 w-6 text-yellow-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[11px] text-slate-400 uppercase font-mono font-black block leading-none">RISK LEVEL</span>
                          <span className={`text-sm font-black block mt-1 truncate ${
                            multiplier < 1.5 ? 'text-emerald-400' :
                            multiplier < 3.0 ? 'text-yellow-400' : 'text-rose-500 animate-pulse'
                          }`}>
                            {multiplier < 1.5 ? 'SAFE' :
                             multiplier < 3.0 ? 'VELOCITY' : 'AVALANCHE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Area: Ascent Controller settings panel next to canvas */}
                <div className="xl:col-span-4 space-y-6">
                  
                  {/* Expedition Go Counter Panel */}
                  <div className="p-6 bg-gradient-to-br from-violet-900/10 via-slate-900 to-slate-950 border-2 border-violet-500/20 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-md" />
                    <span className="text-xs font-black text-violet-400 uppercase tracking-widest font-mono block">
                      EXPEDITION STOCK
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-black text-white font-mono">{remainingGoes}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase font-sans">Remaining Climbs</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono leading-relaxed mt-1">
                      Each climb costs exactly 1 Go. Purchase goes below using your XPR balance.
                    </div>
                  </div>

                  {/* Bulk Goes Purchase Console */}
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-400" /> Bulk Purchase Goes
                      </span>
                      <span className="text-xs text-yellow-400 font-mono bg-yellow-400/10 px-2.5 py-1 rounded border border-yellow-400/20 font-black">
                        1 XPR = 1 GO
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">Or Custom Goes Count</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="Goes amount..."
                            value={customGoesInput}
                            onChange={(e) => setCustomGoesInput(e.target.value)}
                            disabled={gameState === 'climbing'}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-mono text-sm focus:outline-none focus:border-yellow-500 placeholder-slate-600"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const parsed = parseInt(customGoesInput);
                            if (!isNaN(parsed) && parsed > 0) {
                              handleBuyGoes(parsed);
                            }
                          }}
                          disabled={gameState === 'climbing'}
                          className="px-5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                        >
                          Buy
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">Standard Bundles</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[5, 15, 50, 100].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => handleBuyGoes(amt)}
                            disabled={gameState === 'climbing'}
                            className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-black text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <span className="text-base text-white">{amt} Goes</span>
                            <span className="text-[10px] text-yellow-400 font-mono font-bold">{amt} XPR</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Climber Atmosphere Selector */}
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-2xl">
                    <span className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-800">
                      <Sparkles className="h-5 w-5 text-yellow-400" /> Environment
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSceneryPreset('sunny', 'clear')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[85px] ${
                          cosmetics.theme === 'sunny' && cosmetics.weather === 'clear'
                            ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <Sun className="h-5 w-5 text-yellow-400" />
                        <div>
                          <div className="text-xs font-black">Sunny Peak</div>
                          <div className="text-[10px] text-slate-500 leading-none mt-0.5">Clear Skies</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSceneryPreset('rain', 'rain')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[85px] ${
                          cosmetics.theme === 'rain' && cosmetics.weather === 'rain'
                            ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <CloudRain className="h-5 w-5 text-slate-300" />
                        <div>
                          <div className="text-xs font-black">Storm Slabs</div>
                          <div className="text-[10px] text-slate-500 leading-none mt-0.5">Overcast Wet</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSceneryPreset('everest', 'snow')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[85px] ${
                          cosmetics.theme === 'everest' && cosmetics.weather === 'snow'
                            ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <Mountain className="h-5 w-5 text-slate-300" />
                        <div>
                          <div className="text-xs font-black">Swiss Alps</div>
                          <div className="text-[10px] text-slate-500 leading-none mt-0.5">Snow Twilight</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSceneryPreset('cyber', 'neonrain')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[85px] ${
                          cosmetics.theme === 'cyber' && cosmetics.weather === 'neonrain'
                            ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                        <div>
                          <div className="text-xs font-black">Neon Ridge</div>
                          <div className="text-[10px] text-slate-500 leading-none mt-0.5">Showers</div>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* Other displays mapping onto corresponding navigation menus */}
          {activeTab === 'leaderboard' && <Leaderboard prizePool={prizePool} />}

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
          setTokenType={() => {}}
          walletConnected={walletConnected}
          setWalletConnected={setWalletConnected}
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
        />
      )}

      {/* Aesthetic bottom footer disclaimer */}
      <footer className="mt-12 py-10 border-t border-slate-800 text-center text-xs text-slate-500 space-y-6">
        <SummitLogo size="lg" className="mx-auto rounded-3xl" />
        <div>
          <p className="max-w-md mx-auto font-medium text-slate-400">
            Summit is a simulated decentralized cryptocurrency exploration climb. All features represent mock secure models. Enjoy climbing!
          </p>
          <p className="mt-3 font-black text-yellow-400 tracking-widest text-sm uppercase">
            CHARACTERS SUPPORTED: HERO CLIMBER GUY
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;