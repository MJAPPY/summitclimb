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
  Zap,
  Coins as PotIcon
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

  // Currency & Player progression states starting completely fresh!
  const [balance, setBalance] = useState<number>(0);
  const tokenType = 'XPR';
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);

  // Starting empty Counter Panel goes
  const [remainingGoes, setRemainingGoes] = useState<number>(0);

  // Start with 0 prize pool (or basic reset state)
  const [prizePool, setPrizePool] = useState<number>(0);

  // Stats reset
  const [lifetimeGames, setLifetimeGames] = useState<number>(0);
  const [highestMultiplier, setHighestMultiplier] = useState<number>(1.00);
  const [weeklyBest, setWeeklyBest] = useState<number>(1.00);

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
    theme: 'sunny', 
    weather: 'clear',
    flag: 'cyber',
    trail: 'rainbow'
  });

  // Check if active user has administrator clearances
  const isAdmin = walletConnected && walletAddress.toLowerCase() === 'tripseven';

  // Safeguard: Fallback to Arcade Climb if not authorized
  useEffect(() => {
    if (activeTab === 'admin' && !isAdmin) {
      setActiveTab('climb');
    }
  }, [activeTab, isAdmin]);

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

  // Bulk buy goes transaction handler (Rate: 2 XPR per Go)
  const handleBuyGoes = async (count: number) => {
    if (count <= 0) return;
    const cost = count * 2;

    if (balance < cost) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${cost} XPR to purchase ${count} goes. Deposit more tokens.`,
        variant: "destructive"
      });
      return;
    }

    // Attempt real mainnet transfer to wallet if connected
    if (walletConnected) {
      try {
        toast({
          title: "Sending Signature Request",
          description: "Authorize the XPR goes purchase in your WebAuth app...",
        });
        await protonService.transfer('tripseven', cost, 'XPR', `Purchase ${count} climbs bundle - GUYS Summit`);
      } catch (e) {
        toast({
          title: "Transaction Failed",
          description: "Signature request was rejected by WebAuth link.",
          variant: "destructive"
        });
        return;
      }
    }

    // Process payment success (Retain 5% operator fee, send 95% directly to weekly leaderboard pot)
    const poolContribution = cost * 0.95;

    setBalance(prev => prev - cost);
    setRemainingGoes(prev => prev + count);
    setPrizePool(prev => prev + poolContribution);

    toast({
      title: "Climbs Added!",
      description: `Bought ${count} goes for ${cost} XPR. (5% operator fee retained, 95% added to Weekly Prize Pool!)`,
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
    setCosmetics(prev => ({
      ...prev,
      theme: 'sunny',
      weather: 'clear'
    }));

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

          // DYNAMIC SCENIC STAGE LEVEL TRANSITIONS BASED ON CURRENT MULTIPLIER SLOPES
          if (nextVal < 1.50) {
            setCosmetics(c => ({ ...c, theme: 'sunny', weather: 'clear' }));
          } else if (nextVal >= 1.50 && nextVal < 3.00) {
            setCosmetics(c => ({ ...c, theme: 'rain', weather: 'rain' }));
          } else if (nextVal >= 3.00 && nextVal < 5.00) {
            setCosmetics(c => ({ ...c, theme: 'everest', weather: 'snow' }));
          } else if (nextVal >= 5.00 && nextVal < 10.00) {
            setCosmetics(c => ({ ...c, theme: 'cosmic', weather: 'blizzard' }));
          } else if (nextVal >= 10.00) {
            setCosmetics(c => ({ ...c, theme: 'cyber', weather: 'neonrain' }));
          }

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-pink-500 selection:text-white relative overflow-hidden crt-flicker">
      
      {/* 90s grid background aesthetic */}
      <div className="retro-grid pointer-events-none" />

      {/* Cyber top navbar styled like a neon cabinet header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b-4 border-pink-500 px-5 lg:px-10 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(236,72,153,0.4)]">
        <div className="flex items-center gap-5">
          <SummitLogo size="sm" className="shrink-0 border-2 border-cyan-400 rounded-none w-14 h-14" />
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase font-retro leading-none">
              SUMMIT <span className="text-gradient-neon flash-fast">CLIMB</span>
            </h1>
            <span className="text-[10px] font-retro text-cyan-400 tracking-wider block leading-none mt-2 uppercase">
              INSERT COIN • CLIMB THE PEAK
            </span>
          </div>
        </div>

        {/* Global info ticks with the live wallet pot */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2.5 bg-pink-500/15 border-2 border-pink-500 px-3.5 py-2 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <PotIcon className="h-4 w-4 text-pink-400 animate-bounce" />
            <span className="font-retro text-[10px] text-pink-300 uppercase leading-none">WALLET POT:</span>
            <span className="font-retro text-[11px] text-yellow-300 font-extrabold leading-none">{prizePool.toLocaleString()} XPR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-400 animate-pulse border border-black rounded-none" />
            <span className="font-retro uppercase text-[9px] text-green-400 tracking-wider">1,420 ONLINE</span>
          </div>
        </div>

        {/* Wallet trigger & settings */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-pink-400 hover:text-pink-300 border-2 border-pink-500 shadow-md transition-all rounded-none"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-cyan-400" />}
          </button>

          {walletConnected ? (
            <button
              onClick={() => setWalletOpen(true)}
              className="bg-slate-900 border-2 border-cyan-400 rounded-none px-4 py-2 text-sm flex items-center gap-3.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all text-left relative overflow-hidden group font-retro"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white leading-none">@{walletAddress}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                </div>
                <div className="text-[10px] text-cyan-400 mt-1 leading-none font-bold">
                  {balance.toFixed(2)} XPR
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-retro px-4 py-2.5 text-xs tracking-wider transition-all flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Wallet className="h-4 w-4" /> LINK WALLET
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Responsive, highly stylized Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="arcade-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-500">
              <span className="text-[10px] text-pink-400 font-retro uppercase">
                SELECT GAME
              </span>
              <span className="text-[8px] bg-cyan-400/20 text-cyan-400 font-retro px-2 py-0.5 uppercase">
                CORES OK
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('climb')}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-none text-xs font-retro transition-all border-2 group ${
                  activeTab === 'climb' 
                    ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Compass className={`h-4 w-4 shrink-0 ${activeTab === 'climb' ? 'text-pink-400' : 'text-slate-500'}`} /> 
                  <span className="truncate">ARCADE MODE</span>
                </span>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-none text-xs font-retro transition-all border-2 group ${
                  activeTab === 'leaderboard' 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Trophy className={`h-4 w-4 shrink-0 ${activeTab === 'leaderboard' ? 'text-cyan-400' : 'text-slate-500'}`} /> 
                  <span className="truncate">HIGH SCORES</span>
                </span>
                <span className="text-[8px] bg-cyan-400/20 text-cyan-300 px-1 py-0.5 rounded shrink-0 font-bold">15P</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-none text-xs font-retro transition-all border-2 group ${
                  activeTab === 'profile' 
                    ? 'bg-yellow-400/10 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <User className={`h-4 w-4 shrink-0 ${activeTab === 'profile' ? 'text-yellow-400' : 'text-slate-500'}`} /> 
                  <span className="truncate">ACHIEVEMENTS</span>
                </span>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('replays')}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-none text-xs font-retro transition-all border-2 group ${
                  activeTab === 'replays' 
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <History className={`h-4 w-4 shrink-0 ${activeTab === 'replays' ? 'text-purple-400' : 'text-slate-500'}`} /> 
                  <span className="truncate">REPLAY TAPE</span>
                </span>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Conditionally render the Admin SYSTEM SET tab only for tripseven */}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-none text-xs font-retro transition-all border-2 group ${
                    activeTab === 'admin' 
                      ? 'bg-red-500/10 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Settings className={`h-4 w-4 shrink-0 ${activeTab === 'admin' ? 'text-red-400' : 'text-slate-500'}`} /> 
                    <span className="truncate">SYSTEM SET</span>
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Weekly pot explainer item block */}
          <div className="arcade-panel-cyan p-6 space-y-4">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Gift className="h-36 w-36 text-cyan-400" />
            </div>

            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-cyan-500/20 text-cyan-400 text-xs font-retro">
                JACKPOT
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-retro text-white leading-tight">POT SPLIT MODEL</h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                Climb runs cost exactly 2 XPR. Stake tokens pool into the grand pot. At Sunday reset, 95% is distributed to the Top 15 players on the cabinet ledger. 5% developer cut to payment contract.
              </p>
            </div>

            <button 
              onClick={() => setActiveTab('leaderboard')}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-slate-950 font-retro text-[9px] transition-all"
            >
              PRIZE RULES
            </button>
          </div>

          {/* Mini active player badge */}
          <div className="arcade-panel p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 border-2 border-pink-500 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🧗
            </div>

            <div className="min-w-0">
              <div className="text-xs font-retro text-white truncate">
                {walletConnected ? `@${walletAddress}` : "PLAYER 1"}{" "}
                <span className="text-[8px] text-pink-400 bg-pink-400/10 px-1 py-0.5 rounded leading-none font-bold">LV.{level}</span>
              </div>
              <p className="text-[10px] font-retro text-slate-400 mt-1 leading-tight">
                TOP: <span className="text-green-400">{highestMultiplier.toFixed(2)}X</span>
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
                <div className="xl:col-span-8 space-y-6 crt-screen">
                  <GameCanvas
                    multiplier={multiplier}
                    gameState={gameState}
                    cosmetics={cosmetics}
                  />

                  {/* RETRO ARCADE BUTTONS */}
                  <div className="w-full">
                    {gameState === 'climbing' ? (
                      <button
                        onClick={handleBank}
                        className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-retro text-sm border-b-8 border-green-700 active:border-b-2 active:translate-y-1.5 transition-all flex flex-col items-center justify-center gap-2 glow-green shadow-[0_0_40px_rgba(34,197,94,0.6)] cursor-pointer"
                      >
                        <span className="text-[9px] text-green-950 tracking-[0.2em] font-black uppercase">HIT TO COLLECT</span>
                        <span className="text-base font-black">
                          LOCK ALTITUDE: {multiplier.toFixed(2)}x
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartClimb}
                        className="w-full py-7 bg-gradient-to-b from-pink-500 via-purple-600 to-pink-500 hover:from-pink-400 hover:to-purple-500 text-white font-retro text-base border-b-8 border-purple-800 active:border-b-2 active:translate-y-1.5 transition-all flex items-center justify-center gap-3 uppercase cursor-pointer glow-pink shadow-[0_0_40px_rgba(236,72,153,0.4)]"
                      >
                        <span>INSERT COIN • CLIMB</span>
                        <ArrowUpRight className="h-5 w-5 stroke-[4px]" />
                      </button>
                    )}
                  </div>

                  {/* Altitude metrics & details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="arcade-panel-cyan p-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-cyan-400 font-retro flex items-center gap-1">
                          <Flame className="h-4 w-4 text-pink-500 animate-pulse" /> MULTIPLIER
                        </span>
                        <div className="text-5xl font-black text-white font-retro mt-1 font-mono">
                          {multiplier.toFixed(2)}<span className="text-cyan-400 text-2xl font-black ml-0.5">X</span>
                        </div>
                      </div>
                      <div className="h-12 w-[2px] bg-cyan-500/20" />
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-slate-400 font-retro">LEDGER STATUS</span>
                        <div className="text-lg font-retro text-pink-500 mt-1">
                          {multiplier.toFixed(2)} <span className="text-[9px] text-slate-400">PTS</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-6 arcade-panel">
                      <div className="flex items-center gap-3">
                        <Mountain className="h-6 w-6 text-pink-400 shrink-0 animate-pulse" />
                        <div className="min-w-0">
                          <span className="text-[8px] text-slate-400 uppercase font-retro block leading-none">SLOPE</span>
                          <span className="text-xs font-retro text-white block mt-2 truncate capitalize">{cosmetics.theme}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-l border-pink-500/20 pl-4">
                        <ShieldAlert className="h-6 w-6 text-yellow-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[8px] text-slate-400 uppercase font-retro block leading-none">RISK</span>
                          <span className={`text-xs font-retro block mt-2 truncate ${
                            multiplier < 1.5 ? 'text-green-400' :
                            multiplier < 3.0 ? 'text-yellow-400' : 'text-red-500 flash-fast'
                          }`}>
                            {multiplier < 1.5 ? 'SAFE' :
                             multiplier < 3.0 ? 'CAUTION' : 'AVALANCHE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Area: Ascent Controller settings panel next to canvas */}
                <div className="xl:col-span-4 space-y-6">
                  
                  {/* Expedition Go Counter Panel */}
                  <div className="arcade-panel-yellow p-6 space-y-4">
                    <span className="text-[10px] font-retro text-yellow-400 uppercase block">
                      PLAYER COINS
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-black text-white font-retro">{remainingGoes}</span>
                      <span className="text-[10px] text-slate-400 font-retro">CREDITS SLOTS</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-retro leading-relaxed mt-1">
                      2 XPR inserts exactly 1 play. Feed the coin slots below to load climber goes.
                    </div>
                  </div>

                  {/* Bulk Goes Purchase Console */}
                  <div className="arcade-panel p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-pink-500">
                      <span className="text-xs font-retro text-white uppercase flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-400" /> COIN CHUTE
                      </span>
                      <span className="text-[9px] text-yellow-400 font-retro bg-yellow-400/10 px-2 py-1 rounded">
                        2 XPR = 1 COIN
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-retro text-slate-300 uppercase block">SLOT INSERT VALUE</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="Amt..."
                            value={customGoesInput}
                            onChange={(e) => setCustomGoesInput(e.target.value)}
                            disabled={gameState === 'climbing'}
                            className="w-full bg-slate-950 border-2 border-pink-500 p-3 text-white font-retro text-xs focus:outline-none placeholder-slate-700"
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
                          className="px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-retro text-xs border-2 border-black active:translate-y-0.5"
                        >
                          BUY
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-retro text-slate-300 uppercase block">QUICK CHUTE</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[5, 15, 50, 100].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => handleBuyGoes(amt)}
                            disabled={gameState === 'climbing'}
                            className="p-3 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-500 text-xs font-retro text-cyan-400 hover:text-cyan-300 transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                          >
                            <span className="text-[11px] text-white">{amt} COINS</span>
                            <span className="text-[8px] text-yellow-400">{amt * 2} XPR</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Altitude Stage Explainer Card */}
                  <div className="arcade-panel-cyan p-6 space-y-4">
                    <span className="text-xs font-retro text-white uppercase flex items-center gap-1.5 pb-2 border-b border-cyan-500">
                      <Sparkles className="h-4 w-4 text-cyan-400" /> ACTIVE CLIMB STAGES
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Scenery and wind weather will morph dynamically to higher elevation stages as your altitude multiplier rises!
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[9px] font-retro">
                        <span className="text-slate-300">STAGE 1: SUNNY</span>
                        <span className="text-yellow-400">1.00x - 1.50x</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-retro">
                        <span className="text-slate-300">STAGE 2: RAIN</span>
                        <span className="text-blue-400">1.50x - 3.00x</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-retro">
                        <span className="text-slate-300">STAGE 3: ALPINE SNOW</span>
                        <span className="text-purple-400">3.00x - 5.00x</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-retro">
                        <span className="text-slate-300">STAGE 4: BLIZZARD</span>
                        <span className="text-indigo-400">5.00x - 10.00x</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-retro animate-pulse">
                        <span className="text-gradient-neon font-bold">STAGE 5: CYBER NEON</span>
                        <span className="text-pink-400 font-bold">{" > 10.00x"}</span>
                      </div>
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
              referrals={0}
              onOpenReplays={() => setActiveTab('replays')}
              walletAddress={walletAddress}
            />
          )}

          {activeTab === 'replays' && <ReplayManager />}

          {activeTab === 'admin' && isAdmin && <AdminPanel />}

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
      <footer className="mt-12 py-10 border-t-4 border-pink-500 text-center text-[10px] text-slate-500 space-y-6 relative z-10 bg-slate-950">
        <SummitLogo size="lg" className="mx-auto border-4 border-cyan-400 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
        <div>
          <p className="max-w-md mx-auto font-retro uppercase leading-relaxed text-slate-400">
            SUMMIT CABINET © 1994 ALL RIGHT STAKED. ENJOY EXPLORATION GAMES!
          </p>
          <p className="mt-3 font-retro text-yellow-400 tracking-widest text-xs uppercase animate-pulse">
            INSERT PLAY: HERO CLIMBER GUY ONLY
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;