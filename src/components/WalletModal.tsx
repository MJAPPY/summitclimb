import React from 'react';
import { CheckCircle, Cpu, ExternalLink, Shield } from 'lucide-react';
import { protonService } from '@/utils/proton';
import { useToast } from '@/hooks/use-toast';

interface WalletModalProps {
  onClose: () => void;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  guyBalance: number;
  setGuyBalance: React.Dispatch<React.SetStateAction<number>>;
  tokenType: 'XPR' | 'GUY';
  setTokenType: (token: 'XPR' | 'GUY') => void;
  walletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  onSyncBalances: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  onClose,
  balance,
  guyBalance,
  tokenType,
  setTokenType,
  walletConnected,
  setWalletConnected,
  walletAddress,
  setWalletAddress,
  onSyncBalances
}) => {
  const { toast } = useToast();

  // Active balance dynamically switching based on tokenType state
  const activeBalance = tokenType === 'XPR' ? balance : guyBalance;

  // Handle Proton SDK login process dynamically triggering the authentic WebAuth.com overlay
  const handleSDKConnection = async () => {
    try {
      const connection = await protonService.connect();
      setWalletAddress(connection.actor);
      setWalletConnected(true);
      onSyncBalances();
      toast({
        title: "Proton Connected",
        description: `Linked session successfully via Proton Web SDK for @${connection.actor}`,
      });
    } catch (e) {
      toast({
        title: "Link Aborted",
        description: "Failed to establish real-world WebAuth signature connection.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    await protonService.disconnect();
    setWalletConnected(false);
    setWalletAddress('');
    toast({
      title: "Disconnected",
      description: "Ended active Proton link protocol session.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 border-2 border-violet-500/50 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.3)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,6px_100%] pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-violet-500/20 flex justify-between items-center bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/20 border border-violet-500/40 rounded-xl">
              <Cpu className="h-5 w-5 text-violet-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                PROTON SDK LINK <span className="text-[10px] text-violet-400 font-mono bg-violet-400/10 px-2.5 py-0.5 rounded border border-violet-500/30">v2.1</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">Secured Proton Web3 Auth Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-violet-500/20 p-2 rounded-xl transition-all border border-transparent hover:border-violet-500/25"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* STEP 1: Connected / Disconnected Dynamic UI Panels */}
          {!walletConnected ? (
            <div className="space-y-4">
              <div className="text-center py-2">
                <span className="text-xs font-mono text-violet-400 uppercase tracking-widest block font-bold mb-1">CONNECT PROTOCOL WEB SDK</span>
                <p className="text-xs text-slate-400">Scan QR or authorize directly on chain via WebAuth</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleSDKConnection}
                  className="w-full p-4 bg-gradient-to-r from-violet-950/40 to-slate-900 hover:from-violet-900/40 hover:to-slate-800 border-2 border-violet-500/30 hover:border-violet-500 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-violet-500/10 rounded-lg text-xl">📱</div>
                    <div className="text-left">
                      <span className="font-black text-white text-sm block">WebAuth / Proton Selector</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Open official Proton Web SDK drawer</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <a 
                  href="https://webauth.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-slate-500 hover:text-violet-400 font-mono inline-flex items-center gap-1 transition-all"
                >
                  Don't have a WebAuth account? Setup free profile <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Linked account badge */}
              <div className="p-4 bg-slate-900 border border-violet-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-violet-400 font-mono uppercase tracking-wider block leading-none">CONNECTED PROTON WEB SDK SESSION</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-black text-white font-mono">@{walletAddress}</span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg border border-rose-500/20 transition-all font-mono"
                >
                  DISCONNECT
                </button>
              </div>

              {/* Multi-Token Toggle Selector Switch */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setTokenType('XPR')}
                  className={`p-3.5 border-2 text-center transition-all flex flex-col items-center justify-center rounded-xl ${
                    tokenType === 'XPR' 
                      ? 'border-violet-500 bg-violet-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-widest block mb-1">XPR TOKEN</span>
                  <span className="text-base font-black">{balance.toFixed(2)} XPR</span>
                </button>
                <button
                  onClick={() => setTokenType('GUY')}
                  className={`p-3.5 border-2 text-center transition-all flex flex-col items-center justify-center rounded-xl ${
                    tokenType === 'GUY' 
                      ? 'border-violet-500 bg-violet-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-widest block mb-1">GUY TOKEN</span>
                  <span className="text-base font-black">{guyBalance.toFixed(2)} GUY</span>
                </button>
              </div>

              {/* Balance card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-violet-950/20 border border-violet-500/10 rounded-xl">
                <span className="text-xs font-bold text-violet-400 tracking-wider">SELECTED ACTIVE BALANCE</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl font-black text-white">{activeBalance.toFixed(2)}</span>
                  <span className="text-sm font-bold text-slate-400">{tokenType}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
                  <Shield className="h-3 w-3 text-violet-400" />
                  Gasless Web3 transaction protocol active via @WebAuth link.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};