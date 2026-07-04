import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle, RefreshCw, Shield, QrCode, Cpu, ExternalLink, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletModalProps {
  onClose: () => void;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  tokenType: 'CLIMB' | 'USDT' | 'XPR';
  setTokenType: (token: 'CLIMB' | 'USDT' | 'XPR') => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  onClose,
  balance,
  setBalance,
  tokenType,
  setTokenType
}) => {
  const { toast } = useToast();
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletProvider, setWalletProvider] = useState<'WebAuth' | 'Anchor' | 'ProtonWallet' | null>(null);
  
  // Real-time SDK mock states styled like WebAuth.com
  const [sdkStep, setSdkStep] = useState<'selector' | 'qrCode' | 'signing' | 'connected'>('selector');
  const [amountInput, setAmountInput] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(120);

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

  // Countdown timer for WebAuth Proton Web SDK QR code scan
  useEffect(() => {
    let timer: any = null;
    if (sdkStep === 'qrCode' && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setSdkStep('selector');
      setSecondsLeft(120);
      toast({
        title: "Session Expired",
        description: "Proton Web SDK authorization request timed out.",
        variant: "destructive"
      });
    }
    return () => clearInterval(timer);
  }, [sdkStep, secondsLeft]);

  // Handle Proton SDK login process styled like atomicramjet.com
  const triggerSDKConnection = (provider: 'WebAuth' | 'Anchor' | 'ProtonWallet') => {
    setWalletProvider(provider);
    setSecondsLeft(120);
    setSdkStep('qrCode');
    
    toast({
      title: `${provider} SDK Initialized`,
      description: "Dispatching cryptographic authorization request packet...",
    });

    // Simulate instant scan after 4 seconds
    setTimeout(() => {
      setSdkStep('signing');
      setTimeout(() => {
        setWalletConnected(true);
        setWalletAddress('tripseven'); // standard 12-char Proton/EOS account name updated to tripseven
        setSdkStep('connected');
        toast({
          title: "Wallet Linked",
          description: "Authenticated with Proton Web SDK via @tripseven.",
        });
      }, 1500);
    }, 4000);
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletProvider(null);
    setSdkStep('selector');
    toast({
      title: "Disconnected",
      description: "Proton session ended.",
    });
  };

  const handleDeposit = () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please specify a value greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setBalance(prev => prev + amt);
    setTransactions(prev => [
      {
        id: 'TX-' + Math.floor(Math.random() * 900 + 100),
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
      title: "Deposit Authorized",
      description: `Successfully loaded ${amt} ${tokenType} into payment contract.`,
    });
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
      description: `Dispatched ${amt} ${tokenType} to outer blockchain wallet.`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 border-2 border-violet-500/50 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.3)] relative">
        {/* Retro scanlines and glowing matrix grid themed after atomicramjet.com */}
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
          
          {/* STEP 1: Proton Web SDK Selector (AtomicRamjet styling) */}
          {sdkStep === 'selector' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <span className="text-xs font-mono text-violet-400 uppercase tracking-widest block font-bold mb-1">SELECT PROTON AUTH WALLET</span>
                <p className="text-xs text-slate-400">Authenticating with XPR Network mainnet ledger</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => triggerSDKConnection('WebAuth')}
                  className="w-full p-4 bg-gradient-to-r from-violet-950/40 to-slate-900 hover:from-violet-900/40 hover:to-slate-800 border-2 border-violet-500/30 hover:border-violet-500 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-violet-500/10 rounded-lg text-xl">📱</div>
                    <div className="text-left">
                      <span className="font-black text-white text-sm block">WebAuth Wallet</span>
                      <span className="text-[10px] text-slate-400 block font-mono">webauth.com • instant scan auth</span>
                    </div>
                  </div>
                  <ArrowDownRight className="h-4 w-4 text-violet-400 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
                </button>

                <button
                  onClick={() => triggerSDKConnection('ProtonWallet')}
                  className="w-full p-4 bg-gradient-to-r from-violet-950/40 to-slate-900 hover:from-violet-900/40 hover:to-slate-800 border border-white/5 hover:border-violet-500/50 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-white/5 rounded-lg text-xl">⚛️</div>
                    <div className="text-left">
                      <span className="font-bold text-white text-sm block">Proton Wallet App</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Native iOS & Android mobile App</span>
                    </div>
                  </div>
                  <ArrowDownRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                </button>

                <button
                  onClick={() => triggerSDKConnection('Anchor')}
                  className="w-full p-4 bg-gradient-to-r from-violet-950/40 to-slate-900 hover:from-violet-900/40 hover:to-slate-800 border border-white/5 hover:border-violet-500/50 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-white/5 rounded-lg text-xl">⚓</div>
                    <div className="text-left">
                      <span className="font-bold text-white text-sm block">Anchor Wallet</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Greymass Anchor secure login</span>
                    </div>
                  </div>
                  <ArrowDownRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
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
          )}

          {/* STEP 2: Simulated Proton Web SDK QR Scan Prompt */}
          {sdkStep === 'qrCode' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-5 text-center">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-black animate-pulse">AUTHORIZE SESSION PACKET</span>
              
              <div className="p-4 bg-white rounded-2xl border-4 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                {/* Visual authentic QR code representation */}
                <QrCode className="h-44 w-44 text-slate-950" />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  Scan with your {walletProvider} App
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Scan this secure Web3 QR code to establish dynamic session credentials on XPR Network.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-500">
                Session decays in <span className="text-violet-400 font-bold">{secondsLeft}s</span>
              </div>
            </div>
          )}

          {/* STEP 3: Cryptographic Signing */}
          {sdkStep === 'signing' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
              <RefreshCw className="h-12 w-12 text-violet-400 animate-spin" />
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-violet-400 uppercase tracking-widest block font-bold">CRYPTOGRAPHIC SECURE SIGN</span>
                <p className="text-sm font-black text-white">Verifying WebAuth digital signature...</p>
                <p className="text-xs font-mono text-slate-500">ECDSA secp256r1 signature verification on-chain</p>
              </div>
            </div>
          )}

          {/* STEP 4: Fully Connected Wallet Control Panels */}
          {sdkStep === 'connected' && (
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
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold px-4 rounded-xl border border-emerald-500/20 text-xs transition-all flex items-center gap-1.5"
                  >
                    <ArrowDownRight className="h-4 w-4" /> Deposit
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold px-4 rounded-xl border border-blue-500/20 text-xs transition-all flex items-center gap-1.5"
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