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
  
  // Keep track of particles, mountain lines, trail paths
  const particlesRef = useRef<Array<{ x: number; y: number; speedY: number; speedX: number; size: number; color: string }>>([]);
  const climberTrailRef = useRef<Array<{ x: number; y: number; alpha: number; color: string }>>([]);
  const guyYOffsetRef = useRef<number>(240);
  const guyXRef = useRef<number>(50);
  const timeRef = useRef<number>(0);

  // Load GUY avatar image if available
  const guyImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/guy.png';
    img.onload = () => {
      guyImageRef.current = img;
    };
  }, []);

  // Set colors based on cosmic/mountain themes
  const getThemeColors = () => {
    switch (cosmetics.theme) {
      case 'cyber':
        return {
          bgGradStart: '#0f051d',
          bgGradEnd: '#02010a',
          mountainFar: '#2a0a4a',
          mountainMid: '#4b1282',
          mountainNear: '#140024',
          snowColor: '#00ffff',
          grid: 'rgba(0, 255, 255, 0.1)',
        };
      case 'volcanic':
        return {
          bgGradStart: '#200505',
          bgGradEnd: '#080101',
          mountainFar: '#400a0a',
          mountainMid: '#6a0a0a',
          mountainNear: '#200202',
          snowColor: '#ff4500',
          grid: 'rgba(255, 69, 0, 0.1)',
        };
      case 'cosmic':
        return {
          bgGradStart: '#040b20',
          bgGradEnd: '#01030a',
          mountainFar: '#12255c',
          mountainMid: '#2445a2',
          mountainNear: '#030a1c',
          snowColor: '#df80ff',
          grid: 'rgba(223, 128, 255, 0.1)',
        };
      case 'everest':
      default:
        return {
          bgGradStart: '#0a1931',
          bgGradEnd: '#15305b',
          mountainFar: '#1b3b6f',
          mountainMid: '#215f8c',
          mountainNear: '#0f172a',
          snowColor: '#ffffff',
          grid: 'rgba(255, 255, 255, 0.05)',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Generate weather particles once
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 120; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speedY: 1 + Math.random() * 3,
          speedX: -1 - Math.random() * 2,
          size: 1 + Math.random() * 3,
          color: '#ffffff',
        });
      }
    }

    const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const themeColors = getThemeColors();

      // Clear with background gradients
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, themeColors.bgGradStart);
      skyGrad.addColorStop(1, themeColors.bgGradEnd);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines for cosmetic/cyber styling
      if (cosmetics.theme === 'cyber') {
        ctx.strokeStyle = themeColors.grid;
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - 100, canvas.height);
          ctx.stroke();
        }
      }

      // Parallax scroll speed offset based on game multiplier / climb speeds
      const scrollOffset = gameState === 'climbing' ? (multiplier * 4) : 1;

      // Draw Parallax Far Mountain Range
      ctx.fillStyle = themeColors.mountainFar;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 20) {
        const offsetVal = (t * 0.05 * scrollOffset) % 1000;
        const height = 150 + Math.sin((x + offsetVal) * 0.01) * 40 + Math.cos((x - offsetVal) * 0.005) * 20;
        ctx.lineTo(x, canvas.height - height);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw Parallax Mid Mountain Range
      ctx.fillStyle = themeColors.mountainMid;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 15) {
        const offsetVal = (t * 0.12 * scrollOffset) % 1000;
        const height = 100 + Math.cos((x + offsetVal) * 0.015) * 35 + Math.sin((x - offsetVal) * 0.007) * 15;
        ctx.lineTo(x, canvas.height - height);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Near Snowy Mountain Slopes (The real slope GUY is climbing!)
      ctx.fillStyle = themeColors.mountainNear;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      const getSlopeY = (x: number) => {
        // Linear slope scaling down from left to right, plus some bumps
        const baseHeight = 60 + (canvas.width - x) * 0.35;
        const bumps = Math.sin(x * 0.02 + (t * 0.02 * (gameState === 'climbing' ? 1 : 0.1))) * 8;
        return canvas.height - (baseHeight + bumps);
      };

      for (let x = 0; x <= canvas.width + 50; x += 10) {
        ctx.lineTo(x, getSlopeY(x));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw Summit Flag Peak indicator on top left ridge (always visible at top of visual ridge)
      const flagX = 80;
      const flagY = getSlopeY(flagX);

      // Flag poles & flags
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(flagX, flagY);
      ctx.lineTo(flagX, flagY - 50);
      ctx.stroke();

      // Draw Custom Flag Banner
      ctx.fillStyle = cosmetics.flag === 'gold777' ? '#eab308' :
                      cosmetics.flag === 'pirate' ? '#1e1b4b' :
                      cosmetics.flag === 'cyber' ? '#ec4899' : '#3b82f6';
      
      ctx.beginPath();
      ctx.moveTo(flagX, flagY - 50);
      const waveOffset = Math.sin(t * 0.08) * 10;
      ctx.lineTo(flagX + 35, flagY - 40 + waveOffset / 2);
      ctx.lineTo(flagX, flagY - 30);
      ctx.closePath();
      ctx.fill();

      // Write emblem on flags
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(
        cosmetics.flag === 'gold777' ? '777' :
        cosmetics.flag === 'pirate' ? '☠' :
        cosmetics.flag === 'cyber' ? 'CYBER' : 'GUY',
        flagX + 4,
        flagY - 38 + waveOffset / 4
      );

      // Climber Position along slope
      let targetX = 350;
      // Climbing progress climbs slightly higher based on multiplier
      if (gameState === 'climbing') {
        targetX = Math.max(120, 350 - (multiplier - 1) * 15);
      } else if (gameState === 'collapsed') {
        targetX = 350; // fell back
      } else if (gameState === 'banked') {
        targetX = 220; // safe peak
      }

      // Smooth step positioning
      guyXRef.current += (targetX - guyXRef.current) * 0.1;
      const guyBaseY = getSlopeY(guyXRef.current);
      
      // Let him jump/bob slightly while scaling
      const climbBob = gameState === 'climbing' ? Math.abs(Math.sin(t * 0.15)) * 14 : 0;
      guyYOffsetRef.current = guyBaseY - 22 - climbBob;

      // Draw custom climber trails
      if (cosmetics.trail !== 'none' && gameState === 'climbing') {
        let trailColor = '#38bdf8';
        if (cosmetics.trail === 'rainbow') {
          trailColor = `hsl(${(t * 4) % 360}, 100%, 65%)`;
        } else if (cosmetics.trail === 'gold') {
          trailColor = '#eab308';
        } else if (cosmetics.trail === 'fire') {
          trailColor = '#f97316';
        } else if (cosmetics.trail === 'neon') {
          trailColor = '#a855f7';
        }

        climberTrailRef.current.push({
          x: guyXRef.current + (Math.random() * 10 - 5),
          y: guyYOffsetRef.current + 15 + (Math.random() * 10 - 5),
          alpha: 1,
          color: trailColor,
        });
      }

      // Update & render Trails
      climberTrailRef.current.forEach((pt, i) => {
        pt.alpha -= 0.04;
        pt.x += (gameState === 'climbing' ? 2 : 0.5); // move trails backward slightly
        if (pt.alpha <= 0) {
          climberTrailRef.current.splice(i, 1);
          return;
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // DRAW CLIMBER "GUY"
      ctx.save();
      
      // Add subtle glow to our superhero hero GUY
      ctx.shadowBlur = 15;
      ctx.shadowColor = cosmetics.climber === 'gold' ? 'rgba(234, 179, 8, 0.8)' :
                        cosmetics.climber === 'neon' ? 'rgba(168, 85, 247, 0.8)' :
                        cosmetics.climber === 'astro' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(239, 68, 68, 0.5)';

      const climberColor = cosmetics.climber === 'gold' ? '#eab308' :
                           cosmetics.climber === 'neon' ? '#a855f7' :
                           cosmetics.climber === 'astro' ? '#e2e8f0' : '#ef4444';

      const capeColor = cosmetics.climber === 'gold' ? '#78350f' :
                        cosmetics.climber === 'neon' ? '#f43f5e' :
                        cosmetics.climber === 'astro' ? '#2563eb' : '#dc2626';

      // 1. Draw Cape waving dynamically behind GUY
      ctx.fillStyle = capeColor;
      ctx.beginPath();
      ctx.moveTo(guyXRef.current + 8, guyYOffsetRef.current + 4);
      const capeWaveX = guyXRef.current + 25 + (gameState === 'climbing' ? Math.sin(t * 0.25) * 8 : Math.sin(t * 0.08) * 4);
      const capeWaveY = guyYOffsetRef.current + 10 + Math.cos(t * 0.2) * 6;
      ctx.lineTo(capeWaveX, capeWaveY);
      ctx.lineTo(guyXRef.current + 10, guyYOffsetRef.current + 22);
      ctx.closePath();
      ctx.fill();

      if (guyImageRef.current) {
        // Draw real uploaded hero image (the amazing musclebound blonde GUY!)
        ctx.drawImage(
          guyImageRef.current,
          guyXRef.current - 20,
          guyYOffsetRef.current - 45,
          60,
          85
        );
      } else {
        // Fallback Vector climber GUY representation if image loading fails
        ctx.fillStyle = '#fbcfe8'; // skin tone
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 12, 8, 0, Math.PI * 2);
        ctx.fill();

        // Sunglasses banner
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(guyXRef.current - 3, guyYOffsetRef.current - 15, 8, 3);

        // Muscular torso
        ctx.fillStyle = climberColor;
        ctx.fillRect(guyXRef.current - 8, guyYOffsetRef.current - 4, 16, 20);

        // Blonde Hair
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 18, 9, Math.PI, 0);
        ctx.fill();

        // Golden 777 logo belt
        ctx.fillStyle = '#eab308';
        ctx.fillRect(guyXRef.current - 9, guyYOffsetRef.current + 14, 18, 4);

        // Strong muscular arms
        ctx.strokeStyle = climberColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(guyXRef.current - 8, guyYOffsetRef.current);
        const leftArmFlex = gameState === 'climbing' ? Math.sin(t * 0.2) * 5 : 0;
        ctx.lineTo(guyXRef.current - 16, guyYOffsetRef.current - 4 + leftArmFlex);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(guyXRef.current + 8, guyYOffsetRef.current);
        ctx.lineTo(guyXRef.current + 14, guyYOffsetRef.current + 10);
        ctx.stroke();
      }

      ctx.restore();

      // WEATHER PARTICLES DRAWING
      ctx.fillStyle = themeColors.snowColor;
      const weatherSetting = cosmetics.weather;
      
      particlesRef.current.forEach((p) => {
        // Update velocity based on chosen weather severity
        let dragX = p.speedX;
        let dragY = p.speedY;

        if (weatherSetting === 'blizzard') {
          dragX = -8 - Math.random() * 4;
          dragY = 2 + Math.random() * 2;
        } else if (weatherSetting === 'storm') {
          dragX = -4 - Math.random() * 2;
          dragY = 6 + Math.random() * 4;
        } else if (weatherSetting === 'neonrain') {
          dragX = -1;
          dragY = 12 + Math.random() * 3;
        }

        p.x += dragX;
        p.y += dragY;

        // Reset particles
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) {
          p.x = canvas.width;
          p.y = Math.random() * canvas.height;
        }

        // Color override for Neon Rain or Volcanic Spark
        let particleColor = themeColors.snowColor;
        if (weatherSetting === 'neonrain') {
          particleColor = `hsl(${(t * 2 + p.x) % 360}, 100%, 65%)`;
        }

        ctx.fillStyle = particleColor;
        ctx.beginPath();
        if (weatherSetting === 'neonrain') {
          ctx.fillRect(p.x, p.y, 1.5, p.size * 3.5);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Special Collapse explosion on failure
      if (gameState === 'collapsed') {
        const boomGradient = ctx.createRadialGradient(
          guyXRef.current, guyYOffsetRef.current, 5,
          guyXRef.current, guyYOffsetRef.current, 75
        );
        boomGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
        boomGradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
        boomGradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = boomGradient;
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current, 80, 0, Math.PI * 2);
        ctx.fill();

        // Avalanche blocks coming down the slopes
        ctx.fillStyle = '#cbd5e1';
        for (let i = 0; i < 6; i++) {
          const debrisX = guyXRef.current + Math.sin(t * 0.1 + i) * 50;
          const debrisY = guyYOffsetRef.current + (t % 25) * 2 - 10;
          ctx.fillRect(debrisX, debrisY, 14, 10);
        }
      }

      // Draw active climber indicator overlay text if climbing
      if (gameState === 'climbing') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(15, 15, 130, 24);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('• ASCENDING PEAK', 25, 31);
      } else if (gameState === 'banked') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(15, 15, 130, 24);
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('🏆 SECURED BANK', 25, 31);
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
        className="w-full aspect-[2/1] max-h-[420px] object-cover block"
      />
      <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full text-slate-300 pointer-events-none capitalize">
        Theme: {cosmetics.theme} ({cosmetics.weather})
      </div>
    </div>
  );
};