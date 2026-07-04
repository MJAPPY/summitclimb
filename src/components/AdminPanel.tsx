import React, { useState } from 'react';
import { Settings, ShieldAlert, Key, Edit3, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  
  // Configuration adjusters state
  const [weeklyPool, setWeeklyPool] = useState<number>(12500);
  const [seedValue, setSeedValue] = useState<string>('0x777_Summit_Decay_Seed_9a2b');
  const [announcement, setAnnouncement] = useState<string>('Climb Mount Everest Dusk with GUY! Compete in Season 4 to secure fractions of the 12,500 CLIMB prize pool.');

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Weekly tournament parameters securely committed.",
    });
  };

  const handleRegenSeed = () => {
    const newSeed = '0x' + Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setSeedValue(newSeed);
    toast({
      title: "Seed Regenerated",
      description: "Successfully updated security seed parameters.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel adjusters */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-white/5">
            <Settings className="h-4 w-4 text-violet-400" /> Season & Prize Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Weekly Season Prize Pool</label>
              <input
                type="number"
                value={weeklyPool}
                onChange={(e) => setWeeklyPool(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Decay Algorithm Model</label>
              <select className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none">
                <option value="decay-v2">standard-decay-v2</option>
                <option value="decay-v3-steep">steep-exponential-v3</option>
                <option value="high-altitude">high-altitude-variance</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 flex items-center justify-between">
              <span>Cryptographic Secure Seed</span>
              <button
                onClick={handleRegenSeed}
                className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-bold"
              >
                <RefreshCw className="h-3 w-3" /> Roll Seed
              </button>
            </label>
            <input
              type="text"
              value={seedValue}
              readOnly
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-slate-400 font-mono text-xs focus:outline-none cursor-default"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-black py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-violet-950/40"
          >
            <Save className="h-3.5 w-3.5" /> Save Configuration
          </button>
        </div>

        {/* Global Announcement Panel */}
        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-white/5">
            <Edit3 className="h-4 w-4 text-emerald-400" /> Announcement Editor
          </h3>

          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={3}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none"
          />

          <button
            onClick={handleSaveSettings}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-4 rounded-xl transition-all"
          >
            Publish Live Announcement
          </button>
        </div>
      </div>

      {/* Security logging details */}
      <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4 h-fit">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-white/5">
          <ShieldAlert className="h-4 w-4 text-rose-500" /> Audit Ledger
        </h3>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {[
            { tag: 'COMMISSION', desc: 'Web3 payout set to 95% prize pool, @tripseven retains 5%', date: 'Just now' },
            { tag: 'SEED', desc: 'Secure hash cycled successfully', date: '5 mins ago' },
            { tag: 'WALLET', desc: 'Payment contract audit confirmed with zero flags', date: '1 hour ago' },
          ].map((log, i) => (
            <div key={i} className="p-2.5 bg-slate-950/40 rounded-lg border border-white/5 text-[11px]">
              <div className="flex justify-between font-bold text-white">
                <span className="text-rose-400 font-mono">{log.tag}</span>
                <span className="text-[9px] text-slate-500 font-normal">{log.date}</span>
              </div>
              <p className="text-slate-400 mt-1 leading-snug">{log.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};