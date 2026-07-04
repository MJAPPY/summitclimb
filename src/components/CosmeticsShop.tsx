import React from 'react';
import { Sparkles, Coins, Check, Lock, Palette, CloudSnow, Flame, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CosmeticSettings } from './GameCanvas';

interface CosmeticsShopProps {
  cosmetics: CosmeticSettings;
  setCosmetics: React.Dispatch<React.SetStateAction<CosmeticSettings>>;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

interface CosmeticItem {
  id: string;
  category: keyof CosmeticSettings;
  name: string;
  value: any;
  cost: number;
  unlocked: boolean;
  desc: string;
}

export const CosmeticsShop: React.FC<CosmeticsShopProps> = ({
  cosmetics,
  setCosmetics,
  coins,
  setCoins
}) => {
  const { toast } = useToast();
  
  // Simulated initial shop list
  const [items, setItems] = React.useState<CosmeticItem[]>([
    // Climbers
    { id: 'guy-standard', category: 'climber', name: 'Original GUY', value: 'standard', cost: 0, unlocked: true, desc: 'The absolute legendary red-caped hero.' },
    { id: 'guy-gold', category: 'climber', name: 'Golden Champion GUY', value: 'gold', cost: 250, unlocked: false, desc: 'Cover GUY in glistening solid gold armor.' },
    { id: 'guy-neon', category: 'climber', name: 'Cyberpunk Cyber-GUY', value: 'neon', cost: 400, unlocked: false, desc: 'Neon purple futuristic cyborg bodysuit.' },
    { id: 'guy-astro', category: 'climber', name: 'Astronaut Climber', value: 'astro', cost: 600, unlocked: false, desc: 'Zero gravity spacesuit.' },
    // Themes
    { id: 'theme-everest', category: 'theme', name: 'Mount Everest Dusk', value: 'everest', cost: 0, unlocked: true, desc: 'Deep blue snowscapes and starry winds.' },
    { id: 'theme-cyber', category: 'theme', name: 'Cyber Summit Grid', value: 'cyber', cost: 200, unlocked: false, desc: 'Synthwave gridlines with purple canyons.' },
    { id: 'theme-volcanic', category: 'theme', name: 'Volcanic Peak Ridge', value: 'volcanic', cost: 350, unlocked: false, desc: 'Rivers of glowing lava and red ash.' },
    { id: 'theme-cosmic', category: 'theme', name: 'Cosmic Purple Space', value: 'cosmic', cost: 500, unlocked: false, desc: 'Galactic stardust background glow.' },
    // Weather
    { id: 'weather-snow', category: 'weather', name: 'Calm Snowing Flakes', value: 'snow', cost: 0, unlocked: true, desc: 'Peaceful snow drift.' },
    { id: 'weather-storm', category: 'weather', name: 'Gale Wind Storm', value: 'storm', cost: 100, unlocked: false, desc: 'Heavy falling drops with strong force.' },
    { id: 'weather-blizzard', category: 'weather', name: 'Himalayan Blizzard', value: 'blizzard', cost: 250, unlocked: false, desc: 'Extreme blowing whiteout conditions.' },
    { id: 'weather-neonrain', category: 'weather', name: 'Neon Cyber Rain', value: 'neonrain', cost: 350, unlocked: false, desc: 'Streaks of colorful data rain particles.' },
    // Flags
    { id: 'flag-summit', category: 'flag', name: 'Summit Blue Flag', value: 'summit', cost: 0, unlocked: true, desc: 'Standard blue safety explorer flag.' },
    { id: 'flag-gold777', category: 'flag', name: 'Jackpot 777 Flag', value: 'gold777', cost: 150, unlocked: false, desc: 'Shiny gold sheet displaying jackpot digits.' },
    { id: 'flag-pirate', category: 'flag', name: 'Smugglers Jolly Roger', value: 'pirate', cost: 250, unlocked: false, desc: 'Black flag with crossbones and skull.' },
    { id: 'flag-cyber', category: 'flag', name: 'Pink Cyberpunk Banner', value: 'cyber', cost: 300, unlocked: false, desc: 'Glowy pink cyber-banner emblem.' },
    // Trails
    { id: 'trail-none', category: 'trail', name: 'Invisible Air Trail', value: 'none', cost: 0, unlocked: true, desc: 'No special visual path.' },
    { id: 'trail-rainbow', category: 'trail', name: 'Rainbow Sparkles', value: 'rainbow', cost: 300, unlocked: false, desc: 'Dazzling colorful energy trail behind GUY.' },
    { id: 'trail-gold', category: 'trail', name: 'Royal Gold Dust', value: 'gold', cost: 400, unlocked: false, desc: 'Shining gold stardust particles.' },
    { id: 'trail-fire', category: 'trail', name: 'Inferno Flame Trail', value: 'fire', cost: 500, unlocked: false, desc: 'Trailing smoke and lava particles.' },
  ]);

  const handleEquip = (item: CosmeticItem) => {
    setCosmetics(prev => ({
      ...prev,
      [item.category]: item.value
    }));
    toast({
      title: "Cosmetic Equipped",
      description: `Activated ${item.name} successfully!`,
    });
  };

  const handlePurchase = (item: CosmeticItem) => {
    if (coins < item.cost) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${item.cost - coins} more Climber Coins to unlock this.`,
        variant: "destructive"
      });
      return;
    }

    setCoins(prev => prev - item.cost);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, unlocked: true } : i));
    
    // Equip automatically
    setCosmetics(prev => ({
      ...prev,
      [item.category]: item.value
    }));

    toast({
      title: "Cosmetic Unlocked",
      description: `Successfully purchased and equipped ${item.name}!`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Coins & XP Overview banner */}
      <div className="p-6 bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-slate-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Cosmetics Gear Store</h2>
            <p className="text-xs text-slate-400">Customize GUY, his mountain environment, trails, and custom peak flags!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 rounded-xl">
          <Coins className="h-5 w-5 text-yellow-400 animate-bounce" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Coins Balance</div>
            <div className="text-lg font-black text-white leading-none mt-1">{coins} COINS</div>
          </div>
        </div>
      </div>

      {/* Tabs / Category filter display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories rendering */}
        {(['climber', 'theme', 'weather', 'flag', 'trail'] as const).map((cat) => {
          const catItems = items.filter(i => i.category === cat);
          return (
            <div key={cat} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  {cat === 'climber' && <Trophy className="h-4 w-4 text-rose-400" />}
                  {cat === 'theme' && <Sparkles className="h-4 w-4 text-violet-400" />}
                  {cat === 'weather' && <CloudSnow className="h-4 w-4 text-sky-400" />}
                  {cat === 'flag' && <Trophy className="h-4 w-4 text-indigo-400" />}
                  {cat === 'trail' && <Flame className="h-4 w-4 text-amber-400" />}
                  {cat} gear
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {catItems.filter(i => i.unlocked).length} / {catItems.length} Unlocked
                </span>
              </div>

              <div className="space-y-2.5">
                {catItems.map((item) => {
                  const isEquipped = cosmetics[cat] === item.value;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isEquipped
                          ? 'border-violet-500/50 bg-violet-500/5'
                          : 'border-white/5 bg-slate-950/40 hover:border-white/10'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white">{item.name}</span>
                          {isEquipped && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                              Equipped
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.unlocked ? (
                          <button
                            onClick={() => handleEquip(item)}
                            disabled={isEquipped}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isEquipped
                                ? 'bg-emerald-600/20 text-emerald-400 cursor-default'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isEquipped ? <Check className="h-3.5 w-3.5" /> : 'Equip'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(item)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1"
                          >
                            <Lock className="h-3 w-3" />
                            <span>{item.cost}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};