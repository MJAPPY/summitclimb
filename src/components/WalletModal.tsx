import React, { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle, RefreshCw, Layers } from 'lucide-react';
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
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('0x777...guy9e');
  const [amountInput, setAmountInput] = useState<string>('');
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: 'deposit' | 'withdraw' | 'win' | 'purchase';
    amount: number;
    token: string;
    time: string;
    status: 'completed' | 'pending';
  }>>([
    { id: 'TX-901', type: 'deposit', amount: 250, token: 'CLIMB', time: '10 mins ago', status: 'completed' },
    { id: 'TX-802', type: 'win', amount: 84.5, token: 'CLIMB', time: '2 hours ago', status: 'completed' },
    { id: 'TX-703', type: 'withdraw', amount: 100, token: 'USDT', time: 'Yesterday', status: 'completed' },
  ]);

  const handleConnect = () => {
    if (!walletConnected) {
      setWalletConnected(true);
      setWalletAddress('0x4ab82...' + Math.random().toString(16).substr(2, 5));
      toast({
        title: "Wallet Connected",
        description: "Abstract payment integration successfully active.",
      });
    } else {
      setWalletConnected(false);
      toast({
        title: "Disconnected",
        description: "Wallet interface un-linked.",
      });
    }
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
      title: "Deposit Completed",
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-violet-500/10 rounded-full blur-[80px]" />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Secure Summit Wallet</h2>
              <p className="text-xs text-slate-400">Abstract secure blockchain payment hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Connection Status card */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-mono">STATUS</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${walletConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-sm font-semibold text-white">
                  {walletConnected ? 'Connected via Layer-2 Core' : 'Disconnected'}
                </span>
              </div>
              {walletConnected && (
                <p className="text-xs font-mono text-slate-500 mt-0.5">{walletAddress}</p>
              )}
            </div>
            <button
              onClick={handleConnect}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                walletConnected
                  ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90'
              }`}
            >
              {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
            </button>
          </div>

          {/* Token Selector & Balances */}
          <div className="grid grid-cols-3 gap-2">
            {(['CLIMB', 'USDT', 'XPR'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTokenType(t)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  tokenType === t
                    ? 'border-violet-500 bg-violet-500/10 text-white shadow-lg'
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-xs text-slate-500">Token</div>
                <div className="text-sm font-black mt-1">{t}</div>
              </button>
            ))}
          </div>

          <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 border border-white/10 rounded-xl relative overflow-hidden">
            <span className="text-xs font-bold text-indigo-400 tracking-wider">AVAILABLE BALANCE</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white">{balance.toFixed(2)}</span>
              <span className="text-sm font-bold text-slate-400">{tokenType}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <Layers className="h-3 w-3 text-indigo-400" />
              Gas-less transfer mechanics active. Powered by XPR & abstract layers.
            </div>
          </div>

          {/* Transfer Form */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300">Transaction Value</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  disabled={!walletConnected}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
                <button
                  onClick={() => setAmountInput(balance.toString())}
                  disabled={!walletConnected}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-md transition-all"
                >
                  MAX
                </button>
              </div>
              <button
                onClick={handleDeposit}
                disabled={!walletConnected}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold px-4 rounded-xl border border-emerald-500/20 text-xs transition-all flex items-center gap-1.5"
              >
                <ArrowDownRight className="h-4 w-4" /> Deposit
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!walletConnected}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold px-4 rounded-xl border border-blue-500/20 text-xs transition-all flex items-center gap-1.5"
              >
                <ArrowUpRight className="h-4 w-4" /> Withdraw
              </button>
            </div>
          </div>

          {/* History log */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest font-mono">Ledger History</h3>
            <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between text-xs"
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