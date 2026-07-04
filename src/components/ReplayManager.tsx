import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Share2, Compass, Calendar, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClimbRun {
  id: string;
  date: string;
  bankedPoint: number | null;
  collapsePoint: number;
  duration: number; // in seconds
  cosmeticsUsed: string;
}

export const ReplayManager: React.FC = () => {
  const { toast } = useToast();
  
  // High quality runs list
  const runs: ClimbRun[] = [
    { id: 'RUN-777A', date: 'Just now', bankedPoint: 4.82, collapsePoint: 12.43, duration: 8, cosmeticsUsed: 'Standard GUY' },
    { id: 'RUN-554B', date: '2 hours ago', bankedPoint: null, collapsePoint: 3.12, duration: 4, cosmeticsUsed: 'Golden GUY' },
    { id: 'RUN-129X', date: 'Yesterday', bankedPoint: 15.40, collapsePoint: 18.25, duration: 15, cosmeticsUsed: 'Cyber GUY' },
  ];

  const [activeRun, setActiveRun] = useState<ClimbRun>(runs[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // multiplier speed

  // Run the playback progression loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const nextVal = prev + 0.1 * playbackSpeed;
          if (nextVal >= activeRun.duration) {
            setIsPlaying(false);
            return activeRun.duration;
          }
          return nextVal;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeRun]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://summit.game/replay/${activeRun.id}`);
    toast({
      title: "Replay Link Copied",
      description: "Send this replay URL to your clan to prove your altitude bravery!",
    });
  };

  const restartReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Convert time to exact multiplier simulation point
  const getMultiplierAtTime = (time: number) => {
    // Math curve matching crash: accelerating speed
    return parseFloat((1 + Math.pow(time, 1.6) * 0.15).toFixed(2));
  };

  const currentMultiplier = getMultiplierAtTime(currentTime);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Runs history list sidebar */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-400" /> Select Replay Run
        </h3>

        <div className="space-y-2">
          {runs.map((run) => (
            <button
              key={run.id}
              onClick={() => {
                setActiveRun(run);
                setCurrentTime(0);
                setIsPlaying(false);
              }}
              className={`w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                activeRun.id === run.id
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/5 bg-slate-950/40 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-mono">{run.id}</span>
                  <div className="text-sm font-bold text-white mt-1">{run.cosmeticsUsed}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{run.date}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-black ${run.bankedPoint ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {run.bankedPoint ? `${run.bankedPoint.toFixed(2)}x Bank` : 'Collapsed'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Collapse: {run.collapsePoint}x</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Video/Simulation Player Console */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[350px]">
          {/* Top header details */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-bold">REPLAY CONSOLE</span>
              <h2 className="text-lg font-black text-white mt-1">Ascent #{activeRun.id}</h2>
            </div>
            <button
              onClick={handleShare}
              className="bg-white/5 hover:bg-white/10 text-white font-bold px-3 py-1.5 rounded-xl border border-white/5 text-xs transition-all flex items-center gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>

          {/* Center graphic showing multiplier scale */}
          <div className="my-8 text-center relative">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">ACTIVE ALTITUDE SPEED</span>
            <div className="text-6xl font-black text-white tracking-tight mt-1 font-mono">
              {currentMultiplier.toFixed(2)}x
            </div>

            {/* Display bank event checkpoint on the timeline overlay */}
            {activeRun.bankedPoint && currentMultiplier >= activeRun.bankedPoint && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 scale-110 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-black px-3 py-1 rounded">
                SECURED BANK AT {activeRun.bankedPoint.toFixed(2)}x!
              </div>
            )}
            
            {/* Display collapse marker */}
            {currentTime >= activeRun.duration && (
              <div className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded inline-block mt-4">
                💥 MOUNTAIN COLLAPSED AT {activeRun.collapsePoint.toFixed(2)}x
              </div>
            )}
          </div>

          {/* Controls + sliders bar */}
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max={activeRun.duration}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-violet-500 bg-slate-950 rounded-lg appearance-none h-1.5"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all shadow-lg"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={restartReplay}
                  className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 transition-all"
                  title="Restart"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Playback speed selector */}
              <div className="flex gap-1.5">
                {([0.5, 1, 1.5, 2] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      playbackSpeed === spd
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="text-right text-[10px] text-slate-400 font-mono">
                {currentTime.toFixed(1)}s / {activeRun.duration.toFixed(1)}s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};