import React, { useRef, useEffect } from 'react';

export interface CosmeticSettings {
  climber: 'standard' | 'gold' | 'neon' | 'astro';
  theme: 'everest' | 'sunny' | 'rain' | 'cyber' | 'volcanic' | 'cosmic';
  weather: 'clear' | 'snow' | 'rain' | 'storm' | 'blizzard' | 'neonrain';
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
  
  // Track continuous parallax scrolls and particle dynamics
  const particlesRef = useRef<Array<{ x: number; y: number; speedY: number; speedX: number; size: number; color: string; alpha?: number }>>([]);
  const climberTrailRef = useRef<Array<{ x: number; y: number; alpha: number; color: string }>>([]);
  const guyYOffsetRef = useRef<number>(240);
  const guyXRef = useRef<number>(250);
  const timeRef = useRef<number>(0);
  
  // Continuous altitude tracker
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

  // Theme-specific colors and twilight sunset/dusk sky gradients for maximum realism
  const getThemeColors = () => {
    switch (cosmetics.theme) {
      case 'sunny':
        // Gorgeous, crisp golden hour / bright sunny morning in Swiss Alps
        return {
          bgGradStart: '#0284c7', // Deep blue sky
          bgGradMid: '#38bdf8',  // Crisp sky blue
          bgGradEnd: '#bae6fd',   // Soft warm light on horizon
          mountainFar: '#1e293b',
          mountainMid: '#475569',
          mountainNear: '#334155',
          snowColor: '#ffffff',
          accentColor: '#f59e0b',  // Golden sun rays
          snowCrust: '#f1f5f9',
        };
      case 'rain':
        // Overcast, hyper-detailed wet mountain storm
        return {
          bgGradStart: '#0f172a',
          bgGradMid: '#1e293b',
          bgGradEnd: '#334155',
          mountainFar: '#020617',
          mountainMid: '#0f172a',
          mountainNear: '#1e293b',
          snowColor: '#94a3b8',
          accentColor: '#38bdf8',
          snowCrust: '#64748b',
        };
      case 'cyber':
        return {
          bgGradStart: '#060112',
          bgGradMid: '#120224',
          bgGradEnd: '#010005',
          mountainFar: '#1c0330',
          mountainMid: '#39025e',
          mountainNear: '#0c0017',
          snowColor: '#00ffff',
          accentColor: '#ec4899',
          snowCrust: '#00cccc',
        };
      case 'volcanic':
        return {
          bgGradStart: '#140101',
          bgGradMid: '#2b0303',
          bgGradEnd: '#000000',
          mountainFar: '#2b0404',
          mountainMid: '#4d0202',
          mountainNear: '#170101',
          snowColor: '#f97316',
          accentColor: '#ef4444',
          snowCrust: '#ea580c',
        };
      case 'cosmic':
        return {
          bgGradStart: '#010414',
          bgGradMid: '#0a1033',
          bgGradEnd: '#020208',
          mountainFar: '#0d1a3c',
          mountainMid: '#172f6a',
          mountainNear: '#020617',
          snowColor: '#e9d5ff',
          accentColor: '#a855f7',
          snowCrust: '#c084fc',
        };
      case 'everest':
      default:
        // Beautiful realistic Switzerland sunset fading from deep violet twilight to warm golden alpineglow
        return {
          bgGradStart: '#080f26',
          bgGradMid: '#17183b',
          bgGradEnd: '#502040',
          mountainFar: '#0e111a',
          mountainMid: '#171b29',
          mountainNear: '#0c0f1a',
          snowColor: '#f8fafc',
          accentColor: '#38bdf8',
          snowCrust: '#e2e8f0',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 960; // Upgraded resolution for true hero presentation
    canvas.height = 460;

    // Build responsive meteorological wind particle engine
    particlesRef.current = [];
    const count = cosmetics.weather === 'blizzard' || cosmetics.weather === 'storm' ? 180 : 80;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedY: 2 + Math.random() * 4,
        speedX: -2 - Math.random() * 4,
        size: 1 + Math.random() * 2.5,
        color: cosmetics.weather === 'rain' || cosmetics.weather === 'storm' ? 'rgba(156, 163, 175, 0.4)' : '#ffffff',
        alpha: 0.2 + Math.random() * 0.8
      });
    }
  }, [cosmetics.weather]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const themeColors = getThemeColors();

      // Continuous rising scroll animation physics
      const climbSpeed = gameState === 'climbing' ? Math.max(3, multiplier * 4) : 0.6;
      verticalScrollRef.current += climbSpeed;

      // Realistic Sky Twilight/Sunny Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, themeColors.bgGradStart);
      skyGrad.addColorStop(0.5, themeColors.bgGradMid);
      skyGrad.addColorStop(1, themeColors.bgGradEnd);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // SUNNY Presets: Volumetric solar flares, sun burst rays and detailed atmosphere
      if (cosmetics.theme === 'sunny') {
        const sunX = 750 - (verticalScrollRef.current * 0.04) % 150;
        const sunY = 80 + (verticalScrollRef.current * 0.01) % 50;

        // Draw Sun Core
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 90);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        sunGrad.addColorStop(0.1, 'rgba(254, 240, 138, 0.9)');
        sunGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.2)');
        sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
        ctx.fill();

        // Solar rays
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 4;
        for (let r = 0; r < 8; r++) {
          ctx.rotate(Math.PI / 4 + t * 0.001);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 260);
          ctx.stroke();
        }
        ctx.restore();
      }

      // TWINKLING Starry Sky (For dark twilight/cosmic themes)
      if (cosmetics.theme !== 'sunny' && cosmetics.theme !== 'rain') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 55; i++) {
          const starX = (i * 97 - verticalScrollRef.current * 0.1) % canvas.width;
          const starY = (i * 47 + verticalScrollRef.current * 0.05) % (canvas.height - 120);
          const starSize = 0.5 + Math.abs(Math.sin((t + i * 8) * 0.04)) * 1.5;
          ctx.fillRect(starX >= 0 ? starX : starX + canvas.width, starY, starSize, starSize);
        }
      }

      // Overcast Clouds scrolling for Rain/Everest scenery
      if (cosmetics.theme === 'rain' || cosmetics.theme === 'everest') {
        ctx.fillStyle = cosmetics.theme === 'rain' ? 'rgba(71, 85, 105, 0.25)' : 'rgba(255, 255, 255, 0.06)';
        for (let i = 0; i < 4; i++) {
          const cloudX = (i * 320 - verticalScrollRef.current * 0.2) % (canvas.width + 200);
          const finalCloudX = cloudX < -150 ? cloudX + canvas.width + 300 : cloudX;
          ctx.beginPath();
          ctx.arc(finalCloudX, 40 + i * 20, 60, 0, Math.PI * 2);
          ctx.arc(finalCloudX + 40, 30 + i * 20, 75, 0, Math.PI * 2);
          ctx.arc(finalCloudX - 40, 50 + i * 20, 55, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // HIGH FIDELITY GEOMETRY: Far Mountains Silhouette scrolling down-left
      ctx.fillStyle = themeColors.mountainFar;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const farScrollX = (verticalScrollRef.current * 0.12) % canvas.width;
      const farScrollY = (verticalScrollRef.current * 0.08) % 350;
      for (let x = -40; x <= canvas.width + 40; x += 40) {
        const testX = x + farScrollX;
        const baseHeight = 190 + Math.sin(testX * 0.006) * 35;
        const peak = (Math.abs(Math.floor(testX / 130)) % 3 === 0) ? 130 : 25;
        const finalHeight = baseHeight + peak - farScrollY;
        ctx.lineTo(x, canvas.height - Math.max(10, finalHeight));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Detailed Mountain Ridges (adding snow highlights on the peaks for realistic depth)
      ctx.fillStyle = themeColors.mountainMid;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const midScrollX = (verticalScrollRef.current * 0.28) % canvas.width;
      const midScrollY = (verticalScrollRef.current * 0.18) % 280;
      
      const midPoints: Array<{ x: number; y: number }> = [];
      for (let x = -30; x <= canvas.width + 30; x += 30) {
        const testX = x + midScrollX;
        const baseHeight = 140 + Math.cos(testX * 0.012) * 25;
        const finalHeight = baseHeight - midScrollY;
        midPoints.push({ x, y: canvas.height - Math.max(10, finalHeight) });
      }

      midPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Mid peak alpineglow snow highlights
      ctx.fillStyle = themeColors.snowCrust;
      midPoints.forEach((pt, idx) => {
        if (idx > 0 && idx < midPoints.length - 1 && pt.y < 300) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - 15, pt.y + 25);
          ctx.lineTo(pt.x + 15, pt.y + 25);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Pine trees cluster scrolling away
      if (verticalScrollRef.current < 750) {
        const treesFade = Math.max(0, 1 - verticalScrollRef.current / 750);
        ctx.save();
        ctx.globalAlpha = treesFade;
        ctx.fillStyle = cosmetics.theme === 'sunny' ? '#14532d' : '#064e3b';
        const forestScrollX = verticalScrollRef.current * 0.35;
        const forestScrollY = verticalScrollRef.current * 0.15;
        for (let i = 0; i < 9; i++) {
          const treeX = 140 + i * 45 - forestScrollX;
          const treeY = canvas.height - 25 + forestScrollY;
          ctx.beginPath();
          ctx.moveTo(treeX, treeY - 35);
          ctx.lineTo(treeX - 12, treeY);
          ctx.lineTo(treeX + 12, treeY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // NEAR SNOW/ROCK SLOPE (Ascending steeply up to the right!)
      const getSlopeY = (x: number) => {
        const baseHeight = 60 + x * 0.42;
        const waveScroll = Math.sin((x + verticalScrollRef.current * 0.5) * 0.012) * 12;
        return canvas.height - (baseHeight + waveScroll);
      };

      // Draw Main Near Rocky/Snowy Ground Geometry
      ctx.fillStyle = themeColors.mountainNear;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = -20; x <= canvas.width + 40; x += 10) {
        ctx.lineTo(x, getSlopeY(x));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Granite rock shards on the mountain slopes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let i = 0; i < 8; i++) {
        const rockX = (i * 140 - verticalScrollRef.current * 0.6) % (canvas.width + 100);
        const rockY = getSlopeY(rockX) + 12;
        ctx.beginPath();
        ctx.moveTo(rockX, rockY);
        ctx.lineTo(rockX + 15, rockY - 8);
        ctx.lineTo(rockX + 25, rockY + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Draw shiny snow or grass crust depending on theme
      ctx.strokeStyle = themeColors.snowColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 10) {
        if (x === -20) ctx.moveTo(x, getSlopeY(x));
        else ctx.lineTo(x, getSlopeY(x));
      }
      ctx.stroke();

      // Secondary layered ice shading
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 15) {
        if (x === -20) ctx.moveTo(x, getSlopeY(x) + 8);
        else ctx.lineTo(x, getSlopeY(x) + 8);
      }
      ctx.stroke();

      // Milestone flags
      const milestones = [
        { mult: 1.5, label: '1.5x Peak' },
        { mult: 2.0, label: '2.0x Crest' },
        { mult: 3.0, label: '3.0x Glacier' },
        { mult: 5.0, label: '5.0x Ascent' },
        { mult: 10.0, label: '10.0x Ridge' },
        { mult: 15.0, label: '15.0x Stratosphere' },
        { mult: 25.0, label: '25.0x Apex' },
      ];

      milestones.forEach((milestone) => {
        const baseOffset = (milestone.mult - multiplier) * 260;
        const flagX = guyXRef.current + baseOffset;
        
        if (flagX > -50 && flagX < canvas.width + 50) {
          const flagY = getSlopeY(flagX);

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(flagX, flagY + 2, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Flagpole
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(flagX, flagY);
          ctx.lineTo(flagX, flagY - 45);
          ctx.stroke();

          // Flag Pennant
          ctx.fillStyle = cosmetics.flag === 'gold777' ? '#eab308' :
                          cosmetics.flag === 'pirate' ? '#111827' :
                          cosmetics.flag === 'cyber' ? '#ec4899' : '#10b981';

          ctx.beginPath();
          ctx.moveTo(flagX, flagY - 45);
          const bannerWave = Math.sin(t * 0.1 + milestone.mult) * 6;
          ctx.lineTo(flagX - 32, flagY - 38 + bannerWave);
          ctx.lineTo(flagX, flagY - 30);
          ctx.closePath();
          ctx.fill();

          // Labels
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(milestone.label, flagX - 30, flagY - 34 + bannerWave / 2);
        }
      });

      // GUY CLIMBER position
      let targetX = 260;
      if (gameState === 'climbing') {
        targetX = Math.min(720, 260 + (multiplier - 1) * 20);
      } else if (gameState === 'collapsed') {
        targetX = 260;
      } else if (gameState === 'banked') {
        targetX = 640;
      }

      guyXRef.current += (targetX - guyXRef.current) * 0.1;
      const guyBaseY = getSlopeY(guyXRef.current);

      const climbBob = gameState === 'climbing' ? Math.abs(Math.sin(t * 0.24)) * 14 : 0;
      guyYOffsetRef.current = guyBaseY - 26 - climbBob;

      // Draw custom trail
      if (cosmetics.trail !== 'none' && gameState === 'climbing') {
        let trailColor = '#38bdf8';
        if (cosmetics.trail === 'rainbow') {
          trailColor = `hsl(${(t * 4.5) % 360}, 100%, 65%)`;
        } else if (cosmetics.trail === 'gold') {
          trailColor = '#facc15';
        } else if (cosmetics.trail === 'fire') {
          trailColor = '#f97316';
        } else if (cosmetics.trail === 'neon') {
          trailColor = '#ec4899';
        }

        climberTrailRef.current.push({
          x: guyXRef.current + (Math.random() * 10 - 5),
          y: guyYOffsetRef.current + 18 + (Math.random() * 10 - 5),
          alpha: 1,
          color: trailColor,
        });
      }

      climberTrailRef.current.forEach((pt, i) => {
        pt.alpha -= 0.05;
        pt.x -= (gameState === 'climbing' ? 2.8 : 0.6);
        pt.y += (gameState === 'climbing' ? 0.8 : 0.2);
        if (pt.alpha <= 0) {
          climberTrailRef.current.splice(i, 1);
          return;
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // DRAW SUPERHERO CLIMBER GUY
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = cosmetics.climber === 'gold' ? 'rgba(234, 179, 8, 0.8)' :
                        cosmetics.climber === 'neon' ? 'rgba(236, 72, 153, 0.8)' :
                        cosmetics.climber === 'astro' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(239, 68, 68, 0.5)';

      const climberColor = cosmetics.climber === 'gold' ? '#eab308' :
                           cosmetics.climber === 'neon' ? '#ec4899' :
                           cosmetics.climber === 'astro' ? '#e2e8f0' : '#ef4444';

      const capeColor = cosmetics.climber === 'gold' ? '#78350f' :
                        cosmetics.climber === 'neon' ? '#a855f7' :
                        cosmetics.climber === 'astro' ? '#2563eb' : '#dc2626';

      // Cape fluttering
      ctx.fillStyle = capeColor;
      ctx.beginPath();
      ctx.moveTo(guyXRef.current - 8, guyYOffsetRef.current + 4);
      const capeWaveX = guyXRef.current - 26 - (gameState === 'climbing' ? Math.sin(t * 0.3) * 8 : Math.sin(t * 0.1) * 4);
      const capeWaveY = guyYOffsetRef.current + 12 + Math.cos(t * 0.2) * 6;
      ctx.lineTo(capeWaveX, capeWaveY);
      ctx.lineTo(guyXRef.current - 10, guyYOffsetRef.current + 22);
      ctx.closePath();
      ctx.fill();

      if (guyImageRef.current) {
        ctx.save();
        ctx.translate(guyXRef.current, guyYOffsetRef.current);
        ctx.scale(-1, 1);
        ctx.drawImage(
          guyImageRef.current,
          -30,
          -45,
          60,
          85
        );
        ctx.restore();
      } else {
        // High quality fallback vector: Facing Right
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 12, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(guyXRef.current + 1, guyYOffsetRef.current - 15, 7, 3);

        ctx.fillStyle = climberColor;
        ctx.fillRect(guyXRef.current - 8, guyYOffsetRef.current - 4, 16, 20);

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 18, 9, Math.PI, 0);
        ctx.fill();

        ctx.strokeStyle = climberColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(guyXRef.current + 8, guyYOffsetRef.current + 2);
        const rightArmFlex = gameState === 'climbing' ? Math.sin(t * 0.2) * 6 : 0;
        ctx.lineTo(guyXRef.current + 16, guyYOffsetRef.current - 2 + rightArmFlex);
        ctx.stroke();
      }

      ctx.restore();

      // WEATHER WIND AND METEOROLOGICAL ENGINE (Supports clear, snow, rain, blizzard, storm, neonrain)
      if (cosmetics.weather !== 'clear') {
        particlesRef.current.forEach((p) => {
          let dragX = p.speedX;
          let dragY = p.speedY;

          if (gameState === 'climbing') {
            dragY += climbSpeed * 1.5;
            dragX -= climbSpeed * 1.2;
          }

          if (cosmetics.weather === 'blizzard') {
            dragX = -12 - Math.random() * 5;
            dragY = 4 + Math.random() * 3;
          } else if (cosmetics.weather === 'storm' || cosmetics.weather === 'rain') {
            dragX = -4 - Math.random() * 2;
            dragY = 14 + Math.random() * 6;
          } else if (cosmetics.weather === 'neonrain') {
            dragX = -2;
            dragY = 16 + Math.random() * 4;
          }

          p.x += dragX;
          p.y += dragY;

          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < 0) {
            p.x = canvas.width;
            p.y = Math.random() * canvas.height;
          }

          ctx.save();
          if (cosmetics.weather === 'rain' || cosmetics.weather === 'storm') {
            ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + dragX * 0.6, p.y + dragY * 0.6);
            ctx.stroke();
          } else if (cosmetics.weather === 'neonrain') {
            ctx.fillStyle = `hsl(${(t * 2 + p.x) % 360}, 100%, 65%)`;
            ctx.fillRect(p.x, p.y, 1.8, p.size * 4);
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (p.alpha || 0.8) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // Avalanche collapse
      if (gameState === 'collapsed') {
        const boomGradient = ctx.createRadialGradient(
          guyXRef.current, guyYOffsetRef.current, 5,
          guyXRef.current, guyYOffsetRef.current, 90
        );
        boomGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
        boomGradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
        boomGradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = boomGradient;
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current, 95, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#cbd5e1';
        for (let i = 0; i < 9; i++) {
          const debrisX = guyXRef.current - (t % 20) * 3 + Math.sin(i) * 35;
          const debrisY = guyYOffsetRef.current + (t % 20) * 1.5;
          ctx.fillRect(debrisX, debrisY, 14, 10);
        }
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
        className="w-full aspect-[2.1/1] max-h-[520px] object-cover block"
      />
      <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full text-slate-300 pointer-events-none capitalize">
        Theme: {cosmetics.theme} ({cosmetics.weather})
      </div>
    </div>
  );
};