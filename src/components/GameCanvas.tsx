import React, { useRef, useEffect } from 'react';

export interface CosmeticSettings {
  climber: 'standard' | 'gold' | 'neon' | 'astro';
  theme: 'everest' | 'cyber' | 'volcanic' | 'cosmic';
  weather: 'snow' | 'storm' | 'blizzard' | 'neonrain';
  flag: 'summit' | 'gold777' | 'pirate' | 'cyber';
  trail: 'none' | 'rainbow' | 'gold' | 'fire' | 'neon';
}

interface GameCanvasProps {
  multiplier: number;
  gameState: 'idle' | 'climbing' | 'banked' | 'collapsed';
  cosmetics: CosmeticSettings;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ multiplier, gameState, cosmetics }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Particles, trail paths, and scroll position tracking
  const particlesRef = useRef<Array<{ x: number; y: number; speedY: number; speedX: number; size: number; color: string }>>([]);
  const climberTrailRef = useRef<Array<{ x: number; y: number; alpha: number; color: string }>>([]);
  const guyYOffsetRef = useRef<number>(240);
  const guyXRef = useRef<number>(180);
  const timeRef = useRef<number>(0);
  
  // Continuous vertical altitude scroll offset
  const verticalScrollRef = useRef<number>(0);

  // Load GUY avatar image
  const guyImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/guy.png';
    img.onload = () => {
      guyImageRef.current = img;
    };
  }, []);

  // Theme configuration featuring beautiful Switzerland Matterhorn styling
  const getThemeColors = () => {
    switch (cosmetics.theme) {
      case 'cyber':
        return {
          bgGradStart: '#0d041c',
          bgGradEnd: '#020108',
          mountainFar: '#1a0533',
          mountainMid: '#390c66',
          mountainNear: '#0c0017',
          snowColor: '#00ffff',
          accentColor: '#f43f5e',
          grid: 'rgba(0, 255, 255, 0.08)',
        };
      case 'volcanic':
        return {
          bgGradStart: '#1a0303',
          bgGradEnd: '#050000',
          mountainFar: '#330505',
          mountainMid: '#590505',
          mountainNear: '#170101',
          snowColor: '#ef4444',
          accentColor: '#f97316',
          grid: 'rgba(239, 68, 68, 0.08)',
        };
      case 'cosmic':
        return {
          bgGradStart: '#020617',
          bgGradEnd: '#090514',
          mountainFar: '#0f172a',
          mountainMid: '#1e1b4b',
          mountainNear: '#020205',
          snowColor: '#c084fc',
          accentColor: '#a855f7',
          grid: 'rgba(192, 132, 252, 0.08)',
        };
      case 'everest':
      default:
        // High fidelity Switzerland Alpine dusk
        return {
          bgGradStart: '#0c1b33',
          bgGradEnd: '#1e3a8a',
          mountainFar: '#111827',
          mountainMid: '#1e293b',
          mountainNear: '#0f172a',
          snowColor: '#f8fafc',
          accentColor: '#38bdf8',
          grid: 'rgba(255, 255, 255, 0.03)',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    canvas.width = 800;
    canvas.height = 420;

    // Set up particles once
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 150; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speedY: 2 + Math.random() * 4,
          speedX: 1 + Math.random() * 3, // Drift to the right (wind blowing against the climber)
          size: 1 + Math.random() * 3.5,
          color: '#ffffff',
        });
      }
    }

    const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const themeColors = getThemeColors();

      // Continuous vertical climbing animation logic
      const climbSpeed = gameState === 'climbing' ? Math.max(2.5, multiplier * 3.5) : 0.4;
      verticalScrollRef.current += climbSpeed;

      // Clear Canvas with sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, themeColors.bgGradStart);
      skyGrad.addColorStop(1, themeColors.bgGradEnd);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars twinkling and scrolling downwards to the right (to simulate ascending leftwards up the slope)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 40; i++) {
        const starX = (i * 77 + verticalScrollRef.current * 0.15) % canvas.width;
        const starY = (i * 37 + verticalScrollRef.current * 0.3) % (canvas.height - 150);
        const starSize = 0.5 + Math.abs(Math.sin((t + i * 10) * 0.03)) * 1.5;
        ctx.fillRect(starX, starY, starSize, starSize);
      }

      // Draw Glowing Swiss Moon shifting slightly down-right relative to GUY's climb path
      const moonX = 680 + (verticalScrollRef.current * 0.1) % 150;
      const moonY = 80 + (verticalScrollRef.current * 0.2) % 200;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 50);
      moonGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      moonGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.3)');
      moonGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Draw Parallax Far Swiss peaks (Jagged iconic Matterhorn shapes scrolling down-right!)
      ctx.fillStyle = themeColors.mountainFar;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const farScrollX = (verticalScrollRef.current * 0.12) % canvas.width;
      const farScrollY = (verticalScrollRef.current * 0.1) % 300;
      for (let x = -40; x <= canvas.width + 40; x += 40) {
        const testX = x - farScrollX;
        const baseHeight = 160 + Math.sin(testX * 0.005) * 30;
        const peakFactor = (Math.abs(Math.floor(testX / 120)) % 2 === 0) ? 140 : 0; 
        const finalHeight = baseHeight + peakFactor - farScrollY;

        ctx.lineTo(x, canvas.height - Math.max(10, finalHeight));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw Parallax Mid Ranges (scrolling slightly faster down-right)
      ctx.fillStyle = themeColors.mountainMid;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const midScrollX = (verticalScrollRef.current * 0.25) % canvas.width;
      const midScrollY = (verticalScrollRef.current * 0.2) % 250;
      for (let x = -30; x <= canvas.width + 30; x += 30) {
        const testX = x - midScrollX;
        const baseHeight = 110 + Math.cos(testX * 0.01) * 20;
        const finalHeight = baseHeight - midScrollY;
        ctx.lineTo(x, canvas.height - Math.max(10, finalHeight));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw Warm Glowing Alpine Cabins at the foothills - they fade out and scroll down-right as we climb
      if (verticalScrollRef.current < 800) {
        const cabinFade = Math.max(0, 1 - verticalScrollRef.current / 800);
        ctx.save();
        ctx.globalAlpha = cabinFade;
        
        const cabinX = 520 + verticalScrollRef.current * 0.35;
        const cabinY = (canvas.height - 40) + verticalScrollRef.current * 0.25;
        
        ctx.fillStyle = '#451a03'; // dark wood
        ctx.fillRect(cabinX, cabinY, 24, 16);
        ctx.fillStyle = '#b45309'; // warm lit roof
        ctx.beginPath();
        ctx.moveTo(cabinX - 4, cabinY);
        ctx.lineTo(cabinX + 12, cabinY - 8);
        ctx.lineTo(cabinX + 28, cabinY);
        ctx.closePath();
        ctx.fill();
        // Glowing yellow windows
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cabinX + 4, cabinY + 5, 4, 4);
        ctx.fillRect(cabinX + 14, cabinY + 5, 4, 4);
        ctx.restore();
      }

      // Draw Snowy Pine Trees at the base - scrolling down-right as well
      if (verticalScrollRef.current < 900) {
        const treeFade = Math.max(0, 1 - verticalScrollRef.current / 900);
        ctx.save();
        ctx.globalAlpha = treeFade;
        ctx.fillStyle = '#064e3b'; // deep green
        for (let i = 0; i < 4; i++) {
          const treeX = 400 + i * 50 + verticalScrollRef.current * 0.35;
          const treeY = canvas.height - 15 - (i % 2) * 10 + verticalScrollRef.current * 0.25;
          ctx.beginPath();
          ctx.moveTo(treeX, treeY - 25);
          ctx.lineTo(treeX - 10, treeY);
          ctx.lineTo(treeX + 10, treeY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw NEAR SNOWY SLOPE (The active slope being climbed!)
      // Scrolling down and to the right so GUY feels like he is continuously stepping up
      const getSlopeY = (x: number) => {
        // High steep slope: climbing from bottom-right (X=500) to top-left (X=110)
        // Offset mapping to shift bumps to the right
        const scrollXOffset = verticalScrollRef.current * 0.5;
        const baseHeight = 60 + (canvas.width - x) * 0.42;
        
        // Dynamic continuous slope wave scrolling down-right
        const waveScroll = Math.sin((x - scrollXOffset) * 0.015) * 15;
        
        return canvas.height - (baseHeight + waveScroll);
      };

      ctx.fillStyle = themeColors.mountainNear;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width + 50; x += 10) {
        ctx.lineTo(x, getSlopeY(x));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Style a beautiful white Swiss peak outline/crust
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width + 50; x += 10) {
        if (x === 0) ctx.moveTo(x, getSlopeY(x));
        else ctx.lineTo(x, getSlopeY(x));
      }
      ctx.stroke();

      // Draw Summit Flag Peak at the high Swiss Ridge (Top-left)
      // The flag also drifts down-right slightly to simulate climbing beyond it!
      const flagX = 110 + (verticalScrollRef.current * 0.05) % 80;
      const flagY = getSlopeY(flagX);

      // Silver flagpole
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(flagX, flagY);
      ctx.lineTo(flagX, flagY - 55);
      ctx.stroke();

      // Red Swiss cross styled flag
      ctx.fillStyle = '#dc2626'; // Swiss red background
      ctx.beginPath();
      ctx.moveTo(flagX, flagY - 55);
      const wave = Math.sin(t * 0.09) * 8;
      ctx.lineTo(flagX + 38, flagY - 45 + wave / 2);
      ctx.lineTo(flagX, flagY - 35);
      ctx.closePath();
      ctx.fill();

      // Draw the iconic Swiss white cross emblem
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(flagX + 11, flagY - 48 + wave / 4, 8, 2);
      ctx.fillRect(flagX + 14, flagY - 51 + wave / 4, 2, 8);

      // Climber GUY positioning and posture
      // GUY leans forward heavily, stepping leftward and upward
      let targetX = 480; 
      if (gameState === 'climbing') {
        // Steer GUY into the mountain, climbing up-left
        targetX = Math.max(160, 480 - (multiplier - 1) * 22);
      } else if (gameState === 'collapsed') {
        targetX = 480; // swept down by avalanche
      } else if (gameState === 'banked') {
        targetX = 220; // safe peak
      }

      // Smooth step coordinate lerp
      guyXRef.current += (targetX - guyXRef.current) * 0.1;
      const guyBaseY = getSlopeY(guyXRef.current);

      // Posture leaning: GUY leans forward heavily into the mountain when actively scaling
      const climbBob = gameState === 'climbing' ? Math.abs(Math.sin(t * 0.22)) * 15 : 0;
      guyYOffsetRef.current = guyBaseY - 26 - climbBob;

      // Render custom colored exhaust trail particles drifting backward (down-right)
      if (cosmetics.trail !== 'none' && gameState === 'climbing') {
        let trailColor = '#38bdf8';
        if (cosmetics.trail === 'rainbow') {
          trailColor = `hsl(${(t * 5) % 360}, 100%, 65%)`;
        } else if (cosmetics.trail === 'gold') {
          trailColor = '#facc15';
        } else if (cosmetics.trail === 'fire') {
          trailColor = '#ef4444';
        } else if (cosmetics.trail === 'neon') {
          trailColor = '#ec4899';
        }

        climberTrailRef.current.push({
          x: guyXRef.current + (Math.random() * 12 - 6),
          y: guyYOffsetRef.current + 20 + (Math.random() * 12 - 6),
          alpha: 1,
          color: trailColor,
        });
      }

      // Render trails
      climberTrailRef.current.forEach((pt, i) => {
        pt.alpha -= 0.05;
        // Trails blow backward relative to upward climber motion (i.e. down and right)
        pt.x += (gameState === 'climbing' ? 3.5 : 1); 
        pt.y += (gameState === 'climbing' ? 1.5 : 0.5);
        if (pt.alpha <= 0) {
          climberTrailRef.current.splice(i, 1);
          return;
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // DRAW SUPERHERO GUY (leaning heavily into the climb)
      ctx.save();
      
      // Intense shadow glows
      ctx.shadowBlur = 18;
      ctx.shadowColor = cosmetics.climber === 'gold' ? 'rgba(250, 204, 21, 0.9)' :
                        cosmetics.climber === 'neon' ? 'rgba(236, 72, 153, 0.9)' :
                        cosmetics.climber === 'astro' ? 'rgba(56, 189, 248, 0.9)' : 'rgba(220, 38, 38, 0.6)';

      const climberColor = cosmetics.climber === 'gold' ? '#eab308' :
                           cosmetics.climber === 'neon' ? '#ec4899' :
                           cosmetics.climber === 'astro' ? '#e2e8f0' : '#dc2626';

      const capeColor = cosmetics.climber === 'gold' ? '#78350f' :
                        cosmetics.climber === 'neon' ? '#a21caf' :
                        cosmetics.climber === 'astro' ? '#1d4ed8' : '#b91c1c';

      // 1. Draw Cape waving dynamically behind GUY (flutters heavily in the thin alpine wind blowing from top-left)
      ctx.fillStyle = capeColor;
      ctx.beginPath();
      ctx.moveTo(guyXRef.current + 10, guyYOffsetRef.current + 6);
      const windForce = gameState === 'climbing' ? (multiplier * 4) : 2;
      const capeWaveX = guyXRef.current + 28 + (gameState === 'climbing' ? Math.sin(t * 0.3) * (10 + windForce) : Math.sin(t * 0.1) * 6);
      const capeWaveY = guyYOffsetRef.current + 12 + Math.cos(t * 0.25) * 8;
      ctx.lineTo(capeWaveX, capeWaveY);
      ctx.lineTo(guyXRef.current + 12, guyYOffsetRef.current + 26);
      ctx.closePath();
      ctx.fill();

      // Render asset image if loaded
      if (guyImageRef.current) {
        ctx.drawImage(
          guyImageRef.current,
          guyXRef.current - 22,
          guyYOffsetRef.current - 48,
          65,
          90
        );
      } else {
        // High fidelity vector fallback
        // Skin head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 14, 9, 0, Math.PI * 2);
        ctx.fill();

        // Cool sunglasses
        ctx.fillStyle = '#020617';
        ctx.fillRect(guyXRef.current - 4, guyYOffsetRef.current - 17, 9, 3);

        // Strong climber torso
        ctx.fillStyle = climberColor;
        ctx.fillRect(guyXRef.current - 9, guyYOffsetRef.current - 5, 18, 22);

        // Blonde legendary hair
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 20, 10, Math.PI, 0);
        ctx.fill();

        // Gold belt buckle
        ctx.fillStyle = '#facc15';
        ctx.fillRect(guyXRef.current - 10, guyYOffsetRef.current + 15, 20, 4);

        // Strong flexed climbing arms
        ctx.strokeStyle = climberColor;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(guyXRef.current - 9, guyYOffsetRef.current + 2);
        const flexOffset = gameState === 'climbing' ? Math.sin(t * 0.25) * 6 : 0;
        ctx.lineTo(guyXRef.current - 18, guyYOffsetRef.current - 2 + flexOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(guyXRef.current + 9, guyYOffsetRef.current + 2);
        ctx.lineTo(guyXRef.current + 16, guyYOffsetRef.current + 12);
        ctx.stroke();
      }

      ctx.restore();

      // ALPINE WEATHER PARTICLES (wind blowing from top-left, moving down-right)
      ctx.fillStyle = themeColors.snowColor;
      const weatherSetting = cosmetics.weather;

      particlesRef.current.forEach((p) => {
        let dragX = p.speedX;
        let dragY = p.speedY;

        // Dynamic downward-rightward drift relative to the climber ascending up-leftward
        if (gameState === 'climbing') {
          dragY += climbSpeed * 1.8; // drop down
          dragX += climbSpeed * 0.9; // push backward (rightward)
        }

        if (weatherSetting === 'blizzard') {
          dragX = 5 + Math.random() * 5;
          dragY = 6 + Math.random() * 3;
        } else if (weatherSetting === 'storm') {
          dragX = 3 + Math.random() * 3;
          dragY = 9 + Math.random() * 5;
        } else if (weatherSetting === 'neonrain') {
          dragX = 1;
          dragY = 15 + Math.random() * 4;
        }

        p.x += dragX;
        p.y += dragY;

        // Wrap around borders
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) {
          p.x = 0;
          p.y = Math.random() * canvas.height;
        }

        let particleColor = themeColors.snowColor;
        if (weatherSetting === 'neonrain') {
          particleColor = `hsl(${(t * 2.5 + p.x) % 360}, 100%, 65%)`;
        }

        ctx.fillStyle = particleColor;
        ctx.beginPath();
        if (weatherSetting === 'neonrain') {
          ctx.fillRect(p.x, p.y, 1.8, p.size * 4);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render Avalanche collapse on game fail
      if (gameState === 'collapsed') {
        const boomGradient = ctx.createRadialGradient(
          guyXRef.current, guyYOffsetRef.current, 5,
          guyXRef.current, guyYOffsetRef.current, 85
        );
        boomGradient.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
        boomGradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.6)');
        boomGradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = boomGradient;
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current, 90, 0, Math.PI * 2);
        ctx.fill();

        // Floating debris pieces falling downwards
        ctx.fillStyle = '#94a3b8';
        for (let i = 0; i < 8; i++) {
          const debrisX = guyXRef.current + Math.sin(t * 0.15 + i) * 60;
          const debrisY = guyYOffsetRef.current + (t % 30) * 2.5 - 15;
          ctx.fillRect(debrisX, debrisY, 16, 12);
        }
      }

      // Display Altitude Status metrics
      if (gameState === 'climbing') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(20, 20, 160, 28);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, 160, 28);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('🇨🇭 SWISS SUMMIT ASCENT', 30, 37);
      } else if (gameState === 'banked') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(20, 20, 160, 28);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, 160, 28);

        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('🏆 SECURED ALTITUDE', 30, 37);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [multiplier, gameState, cosmetics]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
      <canvas
        ref={canvasRef}
        className="w-full aspect-[2/1] max-h-[440px] object-cover block"
      />
      <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full text-slate-300 pointer-events-none capitalize">
        Swiss Peak ({cosmetics.weather})
      </div>
    </div>
  );
};