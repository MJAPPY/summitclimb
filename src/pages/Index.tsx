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
  AlertCircle
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

  // Cosmetics fixed to high-quality defaults
  const [cosmetics] = useState<CosmeticSettings>({
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Cinematic top navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between">
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Climbers: 1,420</span>
          </div>
          <div className="font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            Decay Seed: <span className="text-violet-400">0x777...guy</span>
          </div>
        </div>

        {/* Wallet trigger & settings */}
        <div className="flex items-center gap-3">
          {/* Audio controller toggle icon */}
          <button
            onClick={toggleMute}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5 text-violet-400" />}
          </button>

          {/* Secure Abstract Wallet balance button */}
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
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Responsive Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 block mb-2">Navigation Panel</span>
            
            <button
              onClick={() => setActiveTab('climb')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'climb' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="h-4 w-4" /> Start Expedition
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'leaderboard' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="h-4 w-4" /> Seasons Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="h-4 w-4" /> GUY Profile Achievements
            </button>

            <button
              onClick={() => setActiveTab('replays')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'replays' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="h-4 w-4" /> Ascent Replays
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="h-4 w-4" /> Admin Controls
            </button>
          </div>

          {/* Mini active player badge */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/5 rounded-full blur-md" />
            <div className="w-12 h-12 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center text-2xl shadow">
              🧗
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                GUY Climber <span className="text-[10px] text-indigo-400 font-mono">Lv.{level}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Highest Altitude: {highestMultiplier.toFixed(2)}x</div>
            </div>
          </div>
        </aside>

        {/* Dynamic Display Dashboard workspace */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Standard Climb Screen and Simulation Loop */}
          {activeTab === 'climb' && (
            <div className="space-y-6">
              
              {/* Display announcement ticker banner */}
              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/15 rounded-xl flex items-center gap-2.5 text-xs text-indigo-200">
                <AlertCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span>Season 4 pool initialized with 12,500 CLIMB. Reach higher peaks to climb the global ranks!</span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left section: Climber Game Controller */}
                <div className="xl:col-span-4 p-5 bg-slate-900/50 border border-white/5 rounded-2xl space-y-5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block pb-2 border-b border-white/5">
                    Climber Controller
                  </span>

                  {/* Bet Amount selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300">Expedition Stake ({tokenType})</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          disabled={gameState === 'climbing'}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            betAmount === amt
                              ? 'bg-violet-600 text-white'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom manual custom auto-cashout multiplier trigger value */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300">Auto Secure Altitude (Multiplier)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2.00 (optional)"
                      value={autoCashOut}
                      onChange={(e) => setAutoCashOut(e.target.value)}
                      disabled={gameState === 'climbing'}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-slate-600"
                    />
                  </div>

                  {/* Ultimate high-visibility climb / BANK controls */}
                  <div className="pt-2">
                    {gameState === 'climbing' ? (
                      <button
                        onClick={handleBank}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black tracking-widest text-sm shadow-xl shadow-emerald-950/50 transition-all flex flex-col items-center justify-center gap-1 animate-pulse"
                      >
                        <span>SECURE BANK NOW</span>
                        <span className="text-xs font-mono font-black text-slate-900 opacity-90">
                          {(betAmount * multiplier).toFixed(2)} {tokenType}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartClimb}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 text-white font-black tracking-widest text-sm shadow-xl shadow-violet-950/50 transition-all flex items-center justify-center gap-2"
                      >
                        <span>START ASCENT</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Safe indicator ticker details */}
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[11px] text-slate-400 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Multiplier speed:</span>
                      <span className="text-slate-300">Exponential</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wallet pool:</span>
                      <span className="text-slate-300">Abstract secure</span>
                    </div>
                  </div>
                </div>

                {/* Right section: Beautiful Parallax scrolling climbing graphics */}
                <div className="xl:col-span-8 space-y-4">
                  <GameCanvas
                    multiplier={multiplier}
                    gameState={gameState}
                    cosmetics={cosmetics}
                  />

                  {/* Active telemetry info panel underneath canvas */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/50 border border-white/5 rounded-2xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">ALTITUDE MULTIPLIER</span>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        {multiplier.toFixed(2)}x
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">SECURED WINNINGS</span>
                      <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                        {(betAmount * multiplier).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">PEAK FORCE (WIND)</span>
                      <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
                        {Math.floor(multiplier * 18)} km/h
                      </div>
                    </div>
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