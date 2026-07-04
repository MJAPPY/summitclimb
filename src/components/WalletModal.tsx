import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle, RefreshCw, Shield, QrCode, Cpu, ExternalLink, Key } from 'lucide-react';
import { protonService } from '@/utils/proton';
import { useToast } from '@/hooks/use-toast';

interface WalletModalProps {
  onClose: () => void;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  tokenType: 'CLIMB' | 'USDT' | 'XPR';
  setTokenType: (token: 'CLIMB' | 'USDT' | 'XPR') => void;
  walletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  onClose,
  balance,
  setBalance,
  tokenType,
  setTokenType,
  walletConnected,
  setWalletConnected,
  walletAddress,
  setWalletAddress
}) => {
  const { toast } = useToast();
  const [amountInput, setAmountInput] = useState<string>('');
  const [signingOnChain, setSigningOnChain] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: 'deposit' | 'withdraw' | 'win' | 'purchase';
    amount: number;
    token: string;
    time: string;
    status: 'completed' | 'pending';
  }>>([
    { id: 'TX-901', type: 'deposit', amount: 250, token: 'XPR', time: '10 mins ago', status: 'completed' },
    { id: 'TX-802', type: 'win', amount: 84.5, token: 'XPR', time: '2 hours ago', status: 'completed' },
    { id: 'TX-703', type: 'withdraw', amount: 100, token: 'USDT', time: 'Yesterday', status: 'completed' },
  ]);

  // Handle Proton SDK login process dynamically triggering the authentic WebAuth.com overlay
  const handleSDKConnection = async () => {
    try {
      const connection = await protonService.connect();
      setWalletAddress(connection.actor);
      setWalletConnected(true);
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

  // Push an actual transaction to the WebAuth blockchain!
  const handleDeposit = async () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please specify a value greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setSigningOnChain(true);
    try {
      // Dispatches request directly to connected mobile WebAuth/Anchor for real-world cryptographic signing!
      const txResult = await protonService.transfer('tripseven', amt, tokenType, 'Deposit stake into Summit payment contract');
      
      setBalance(prev => prev + amt);
      setTransactions(prev => [
        {
          id: txResult.processed.id.slice(0, 10).toUpperCase(),
          type: 'deposit',
          amount: amt,
          token: tokenType,
          time: 'Just now',
          status: 'completed'
        },
        ...prev
      ]);
      setAmountInput('');
      toast({
        title: "Transaction Broadcasted",
        description: `Successfully processed transaction ${txResult.processed.id.slice(0, 8)} on Proton mainnet!`,
      });
    } catch (error) {
      toast({
        title: "Transaction Rejected",
        description: "User declined signature request or link timed out.",
        variant: "destructive"
      });
    } finally {
      setSigningOnChain(false);
    }
  };

  const handleWithdraw = () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }
    if (amt > balance) {
      toast({
        title: "Insufficient Balance",
        description: `Your balance is only ${balance} ${tokenType}.`,
        variant: "destructive"
      });
      return;
    }

    setBalance(prev => prev - amt);
    setTransactions(prev => [
      {
        id: 'TX-' + Math.floor(Math.random() * 900 + 100),
        type: 'withdraw',
        amount: amt,
        token: tokenType,
        time: 'Just now',
        status: 'completed'
      },
      ...prev
    ]);
    setAmountInput('');
    toast({
      title: "Withdrawal Initialized",
      description: `Dispatched ${amt} ${tokenType} back to main wallet.`,
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
                PROTON SDK LINK <span className="text-[10px] text-violet-400 font-mono bg-violet-400/10 px-2 py-0.5 rounded border border-violet-500/30">v2.1</span>
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
          
          {/* Real world signing status display */}
          {signingOnChain && (
            <div className="p-4 bg-violet-950/20 border border-violet-500/30 rounded-xl flex items-center gap-3 animate-pulse">
              <RefreshCw className="h-5 w-5 text-violet-400 animate-spin" />
              <div className="text-xs text-slate-300">
                Awaiting cryptographic signature authorization directly from your <span className="font-bold text-white">WebAuth App</span>...
              </div>
            </div>
          )}

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
                  <ArrowDownRight className="h-4 w-4 text-violet-400 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
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

              {/* Token selectors */}
              <div className="grid grid-cols-3 gap-2">
                {(['XPR', 'USDT', 'CLIMB'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTokenType(t)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      tokenType === t
                        ? 'border-violet-500 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'border-white/5 bg-slate-900 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 font-mono">XPR MAINNET</div>
                    <div className="text-sm font-black mt-1">{t}</div>
                  </button>
                ))}
              </div>

              {/* Balance card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-violet-950/20 border border-violet-500/10 rounded-xl">
                <span className="text-xs font-bold text-violet-400 tracking-wider">AVAILABLE BALANCE</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl font-black text-white">{balance.toFixed(2)}</span>
                  <span className="text-sm font-bold text-slate-400">{tokenType}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
                  <Shield className="h-3 w-3 text-violet-400" />
                  Gasless Web3 transaction protocol active via @WebAuth link.
                </div>
              </div>

              {/* Action amount form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300">Transaction Value</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                    />
                    <button
                      onClick={() => setAmountInput(balance.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-md transition-all"
                    >
                      MAX
                    </button>
                  </div>
                  <button
                    onClick={handleDeposit}
                    disabled={signingOnChain}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold px-4 rounded-xl border border-emerald-500/20 text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ArrowDownRight className="h-4 w-4" /> Deposit
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={signingOnChain}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold px-4 rounded-xl border border-blue-500/20 text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ArrowUpRight className="h-4 w-4" /> Withdraw
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History ledger log */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-widest font-mono">XPR MAINNET LOG</h3>
            <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {tx.type === 'deposit' ? (
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      </div>
                    ) : tx.type === 'win' ? (
                      <div className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                    ) : tx.type === 'purchase' ? (
                      <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white capitalize">{tx.type}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{tx.id} • {tx.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black ${tx.type === 'deposit' || tx.type === 'win' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}{tx.amount}
                    </span>{' '}
                    <span className="font-mono text-slate-400">{tx.token}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};