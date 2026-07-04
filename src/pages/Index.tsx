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
  Coins
} from 'lucide-react';

const Index = () => {
  const { toast } = useToast();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'climb' | 'leaderboard' | 'profile' | 'replays' | 'admin'>('climb');
  const [walletOpen, setWalletOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Global lifted Wallet Connection state styled like askguy.app
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Currency & Player progression states
  const [balance, setBalance] = useState<number>(350);
  const [tokenType, setTokenType] = useState<'CLIMB' | 'USDT' | 'XPR'>('XPR'); // Default to XPR for Proton SDK
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
  const [customBetInput, setCustomBetInput] = useState<string>('');
  const [useCustomBet, setUseCustomBet] = useState<boolean>(false);
  const [autoCashOut, setAutoCashOut] = useState<string>('');

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

  // Get active bet amount based on selection or custom input
  const getActiveBetAmount = () => {
    if (useCustomBet) {
      const parsed = parseFloat(customBetInput);
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    }
    return betAmount;
  };

  // Start ascending summit climb
  const handleStartClimb = () => {
    if (gameState === 'climbing') return;
    const currentBet = getActiveBetAmount();

    if (currentBet <= 0) {
      toast({
        title: "Invalid Bet Amount",
        description: "Please specify or type a valid stake greater than 0.",
        variant: "destructive"
      });
      return;
    }

    if (balance < currentBet) {
      toast({
        title: "Insufficient Balance",
        description: "Deposit more tokens using the wallet interface above.",
        variant: "destructive"
      });
      return;
    }

    // Deduct bet amount
    setBalance(prev => prev - currentBet);
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
      description: `Bet of ${currentBet.toFixed(4)} ${tokenType} committed. GUY is climbing!`,
    });
  };

  // Safe Cash out bank triggers
  const handleBank = () => {
    if (gameState !== 'climbing') return;
    setGameState('banked');

    audioSynth.stopHeartbeat();
    audioSynth.stopYodelMusic();
    audioSynth.playBankSound();

    const currentBet = getActiveBetAmount();
    const winnings = currentBet * multiplier;
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
      description: `Winnings: ${winnings.toFixed(4)} ${tokenType}. Earned +${xpEarned} XP.`,
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

          const autoVal = parseFloat(autoCashOut);
          if (!isNaN(autoVal) && autoVal > 1.01 && nextVal >= autoVal) {
            handleBank();
            clearInterval(interval);
            return autoVal;
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
  }, [gameState, hiddenCollapsePoint, autoCashOut, betAmount, customBetInput, useCustomBet, tokenType]);

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
      {/* Cinematic top navbar styled after askguy.app */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b-2 border-slate-800 px-5 lg:px-10 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <SummitLogo size="sm" className="shrink-0 rounded-2xl animate-pulse" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              GUYS <span className="text-gradient-gold">Summit</span>
            </h1>
            <span className="text-xs font-black text-amber-400 tracking-widest block leading-none mt-1 uppercase">
              climb the pinnacle
            </span>
          </div>
        </div>

        {/* Global info ticks */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse border-2 border-emerald-950" />
            <span className="font-extrabold tracking-wide uppercase text-xs">Active Climbers: 1,420</span>
          </div>
          <div className="font-mono bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
            Decay Seed: <span className="text-yellow-400 font-extrabold">0x777...guy</span>
          </div>
        </div>

        {/* Wallet trigger & settings with askguy.app dynamic header credentials */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-xl border border-slate-700 shadow transition-all animate-none"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-yellow-400" />}
          </button>

          {walletConnected ? (
            <button
              onClick={() => setWalletOpen(true)}
              className="bg-gradient-to-r from-violet-900/20 via-slate-900 to-slate-950 border-2 border-violet-500/50 hover:border-violet-400 rounded-xl px-5 py-2 text-sm flex items-center gap-3.5 shadow-lg shadow-violet-950/40 transition-all text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-violet-500/10 rounded-full blur-sm pointer-events-none" />
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-base border border-violet-500/30">
                🧗
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white font-mono leading-none">@{walletAddress}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-none">
                  {balance.toFixed(2)} {tokenType}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-450 hover:to-amber-450 text-slate-950 font-black px-5 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2 border-b-2 border-amber-600 shadow-md animate-pulse"
            >
              <Wallet className="h-4 w-4" /> Connect Proton SDK
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Responsive Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-2xl">
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest px-3 block mb-3 border-b border-slate-800 pb-2">
              Navigation Hub
            </span>
            
            <button
              onClick={() => setActiveTab('climb')}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border ${
                activeTab === 'climb' 
                  ? 'bg-slate-800 border-yellow-500/50 text-white shadow-lg' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <Compass className={`h-5 w-5 ${activeTab === 'climb' ? 'text-yellow-400' : ''}`} /> Start Expedition
              </span>
              {activeTab === 'climb' && <span className="text-[10px] bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-2.5 py-0.5 rounded-full font-mono font-black animate-pulse">LIVE</span>}
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border ${
                activeTab === 'leaderboard' 
                  ? 'bg-slate-800 border-yellow-500/50 text-white shadow-lg' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className={`h-5 w-5 ${activeTab === 'leaderboard' ? 'text-yellow-400' : ''}`} /> Seasons Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border ${
                activeTab === 'profile' 
                  ? 'bg-slate-800 border-yellow-500/50 text-white shadow-lg' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User className={`h-5 w-5 ${activeTab === 'profile' ? 'text-yellow-400' : ''}`} /> GUY Achievements
            </button>

            <button
              onClick={() => setActiveTab('replays')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border ${
                activeTab === 'replays' 
                  ? 'bg-slate-800 border-yellow-500/50 text-white shadow-lg' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <History className={`h-5 w-5 ${activeTab === 'replays' ? 'text-yellow-400' : ''}`} /> Ascent Replays
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-sm font-black tracking-wider transition-all border ${
                activeTab === 'admin' 
                  ? 'bg-slate-800 border-yellow-500/50 text-white shadow-lg' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className={`h-5 w-5 ${activeTab === 'admin' ? 'text-yellow-400' : ''}`} /> Admin Controls
            </button>
          </div>

          {/* Mini active player badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4.5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-full blur-xl" />
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-4xl shadow-inner relative">
              🧗
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <div>
              <div className="text-base font-black text-white flex items-center gap-1.5">
                {walletConnected ? `@${walletAddress}` : "GUY Climber"}{" "}
                <span className="text-xs text-yellow-400 font-mono bg-yellow-400/10 px-2.5 py-0.5 rounded">Lv.{level}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">Best altitude: <span className="text-emerald-400 font-black text-sm">{highestMultiplier.toFixed(2)}x</span></p>
            </div>
          </div>
        </aside>

        {/* Dynamic Display Dashboard workspace */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* Standard Climb Screen */}
          {activeTab === 'climb' && (
            <div className="space-y-8">
              
              <HighScoresTicker />

              <div className="space-y-6">
                <div>
                  <GameCanvas
                    multiplier={multiplier}
                    gameState={gameState}
                    cosmetics={cosmetics}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Dedicated Altitude Display panel */}
                  <div className="md:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-yellow-400 font-black tracking-wider uppercase flex items-center gap-1.5 font-mono">
                        <Flame className="h-4 w-4 text-yellow-400 animate-pulse" /> CURRENT ALTITUDE
                      </span>
                      <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter mt-1">
                        {multiplier.toFixed(2)}<span className="text-yellow-400 text-2xl font-black ml-0.5">x</span>
                      </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800" />
                    <div className="flex flex-col text-right">
                      <span className="text-[11px] text-slate-400 font-black tracking-wider uppercase font-mono">EST. RECOVERED</span>
                      <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono tracking-tight mt-1.5">
                        {(getActiveBetAmount() * multiplier).toFixed(2)} <span className="text-xs text-slate-400 font-bold">{tokenType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Environment details */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shrink-0">
                        <Mountain className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-black block leading-none">SLOPE</span>
                        <span className="text-xs font-bold text-white block mt-1 truncate capitalize">{cosmetics.theme}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-y sm:border-y-0 sm:border-x border-slate-850 py-3 sm:py-0 sm:px-4">
                      <div className="p-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shrink-0">
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-black block leading-none">RISK</span>
                        <span className={`text-xs font-black block mt-1 truncate ${
                          multiplier < 1.5 ? 'text-emerald-400' :
                          multiplier < 3.0 ? 'text-yellow-400' : 'text-rose-500 animate-pulse'
                        }`}>
                          {multiplier < 1.5 ? 'SAFE' :
                           multiplier < 3.0 ? 'VELOCITY' : 'AVALANCHE'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shrink-0">
                        <ShieldAlert className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-black block leading-none">SPEED</span>
                        <span className="text-xs font-bold text-yellow-400 font-mono block mt-1 truncate">
                          {Math.floor(multiplier * 18)} km/h
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CONTROLS AREA */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Climber Controller Action Box */}
                <div className="md:col-span-7 p-7 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                    <span className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-400" /> Ascent Console
                    </span>
                    <span className="text-[11px] text-yellow-400 font-mono bg-yellow-400/10 px-2.5 py-0.5 rounded border border-yellow-400/20 font-black">
                      MANUAL / AUTO ACTIVE
                    </span>
                  </div>

                  {/* Stake Selector */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">Expedition Stake ({tokenType})</label>
                      <button 
                        onClick={() => setUseCustomBet(!useCustomBet)}
                        disabled={gameState === 'climbing'}
                        className="text-[10px] text-yellow-400 hover:text-yellow-300 font-black uppercase tracking-wider font-mono border-b border-yellow-500/30 pb-0.5"
                      >
                        {useCustomBet ? 'Use Presets' : 'Custom Amount'}
                      </button>
                    </div>

                    {useCustomBet ? (
                      <div className="relative">
                        <input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          placeholder={`Enter custom stake in ${tokenType}...`}
                          value={customBetInput}
                          onChange={(e) => setCustomBetInput(e.target.value)}
                          disabled={gameState === 'climbing'}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-yellow-500 placeholder-slate-600"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-black text-slate-500 uppercase">
                          {tokenType}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2.5">
                        {[10, 25, 50, 100].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setBetAmount(amt)}
                            disabled={gameState === 'climbing'}
                            className={`py-3.5 rounded-xl text-sm font-black transition-all border ${
                              betAmount === amt
                                ? 'bg-slate-800 border-yellow-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {amt}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block font-mono">
                      XPR Network Token Explorer contract reference: <a href="https://explorer.xprnetwork.org/tokens/XPR-proton-eosio.token" target="_blank" rel="noopener noreferrer" className="text-yellow-500/80 hover:text-yellow-400 underline">eosio.token</a>
                    </span>
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-yellow-500 placeholder-slate-600"
                    />
                  </div>

                  {/* Large High-Contrast Climb Trigger Action */}
                  <div className="pt-3">
                    {gameState === 'climbing' ? (
                      <button
                        onClick={handleBank}
                        className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:opacity-95 text-slate-950 font-black tracking-wider text-base shadow-2xl border-2 border-emerald-300 transition-all flex flex-col items-center justify-center gap-2 animate-pulse"
                      >
                        <span className="text-xs uppercase font-black tracking-widest text-slate-900 opacity-90">SECURE HARNESS & RETREAT</span>
                        <span className="text-lg font-mono font-black text-slate-950">
                          BANK NOW: {(getActiveBetAmount() * multiplier).toFixed(4)} {tokenType}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartClimb}
                        className="w-full py-6 rounded-2xl bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-350 hover:to-amber-450 text-slate-950 font-black tracking-wider text-base shadow-2xl border border-yellow-300 transition-all flex items-center justify-center gap-3 uppercase"
                      >
                        <span>LAUNCH EXPEDITION</span>
                        <ArrowUpRight className="h-6 w-6 text-slate-950" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scenic Controller Presets Box */}
                <div className="md:col-span-5 p-7 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 shadow-2xl">
                  <div className="pb-3.5 border-b border-slate-800">
                    <span className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2.5">
                      <Sparkles className="h-5 w-5 text-yellow-400" /> Climber Environment
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSceneryPreset('sunny', 'clear')}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'sunny' && cosmetics.weather === 'clear'
                          ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <Sun className="h-5 w-5 text-yellow-400" />
                      <div>
                        <div className="text-xs font-black">Sunny Peak</div>
                        <div className="text-[10px] text-slate-500 leading-none mt-1">Clear Skies</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSceneryPreset('rain', 'rain')}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'rain' && cosmetics.weather === 'rain'
                          ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
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
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'everest' && cosmetics.weather === 'snow'
                          ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
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
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-[90px] ${
                        cosmetics.theme === 'cyber' && cosmetics.weather === 'neonrain'
                          ? 'border-yellow-500 bg-slate-800 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <Sparkles className="h-5 w-5 text-yellow-400" />
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