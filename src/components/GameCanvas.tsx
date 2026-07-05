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
  isLeaping?: boolean; // Receive leap visual triggers from gameplay core
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ multiplier, gameState, cosmetics, isLeaping = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // High fidelity particle engines (Atmospheric elements, wind drifts, rock slides, sparks)
  const weatherParticlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    phase: number;
    amplitude: number;
  }>>([]);

  const sparkParticlesRef = useRef<Array<{
    x: number;
    <dyad-write path="src/components/GameCanvas.tsx" description="Complete implementation of GameCanvas rendering high altitude leaps, trailing stars, falling boulders, and grazing Swiss fauna.">
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
  isLeaping?: boolean; // Leaping state from Index.tsx
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ multiplier, gameState, cosmetics, isLeaping = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // High fidelity particle engines (Atmospheric elements, wind drifts, rock slides, sparks)
  const weatherParticlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    phase: number;
    amplitude: number;
  }>>([]);

  const sparkParticlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
  }>>([]);

  const climberTrailRef = useRef<Array<{
    x: number;
    y: number;
    alpha: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
  }>>([]);

  // Animated creatures & foliage physics
  const birdsRef = useRef<Array<{
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    size: number;
    wingAngle: number;
    wingDir: number;
    color: string;
  }>>([]);

  const goatRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    state: 'idle' | 'walking' | 'jumping';
    frame: number;
    dir: number;
    cooldown: number;
  }>({
    x: 150,
    y: 400,
    active: false,
    state: 'idle',
    frame: 0,
    dir: 1,
    cooldown: 120
  });

  // Dynamic Camera Engine for realistic panoramic viewing, recoil rumble & tracking sweeps
  const cameraRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    shake: number;
    shakeDecay: number;
  }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    shake: 0,
    shakeDecay: 0.92
  });

  // Kinetic state tracking
  const guyXRef = useRef<number>(250);
  const guyYRef = useRef<number>(450);
  const prevGameStateRef = useRef<string>('idle');
  const scrollRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const lightningStrikeRef = useRef<{ active: boolean; intensity: number; timer: number }>({
    active: false,
    intensity: 0,
    timer: 0
  });

  // Fetch or fall back to high-res local asset
  const guyImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/guy.png';
    img.onload = () => {
      guyImageRef.current = img;
    };
  }, []);

  // Compute hyper-realistic procedural mountain slopes
  const getSlopeY = (x: number, scroll: number) => {
    const baseSlope = 160 + x * 0.44;
    // Layered high-frequency octaves to simulate jagged rock crags
    const terrainNoise = Math.sin((x + scroll * 0.5) * 0.008) * 22 +
                        Math.cos((x + scroll * 0.15) * 0.024) * 10 +
                        Math.sin((x + scroll * 0.9) * 0.055) * 4;
    return 800 - (baseSlope + terrainNoise);
  };

  // Aesthetic theme coloring vectors
  const getThemePalette = () => {
    switch (cosmetics.theme) {
      case 'sunny':
        return {
          skyColors: ['#0369a1', '#0ea5e9', '#38bdf8', '#bae6fd'],
          sunColor: 'rgba(255, 255, 255, 0.98)',
          fogColor: 'rgba(224, 242, 254, 0.45)',
          rockShadow: '#064e3b',
          rockHighlight: '#047857',
          snowColor: '#22c55e',
          snowIce: '#10b981',
          gridColor: 'rgba(56, 189, 248, 0.12)'
        };
      case 'rain':
        return {
          skyColors: ['#020617', '#0f172a', '#1e293b', '#334155'],
          sunColor: 'rgba(148, 163, 184, 0.25)',
          fogColor: 'rgba(51, 65, 85, 0.65)',
          rockShadow: '#020617',
          rockHighlight: '#1e293b',
          snowColor: '#64748b',
          snowIce: '#475569',
          gridColor: 'rgba(14, 165, 233, 0.08)'
        };
      case 'cyber':
        return {
          skyColors: ['#04010a', '#120224', '#0c001a', '#020005'],
          sunColor: 'rgba(236, 72, 153, 0.75)',
          fogColor: 'rgba(12, 0, 26, 0.85)',
          rockShadow: '#090014',
          rockHighlight: '#2e004f',
          snowColor: '#00ffff',
          snowIce: '#ec4899',
          gridColor: 'rgba(236, 72, 153, 0.24)'
        };
      case 'volcanic':
        return {
          skyColors: ['#090101', '#210202', '#3f0404', '#0a0000'],
          sunColor: 'rgba(239, 68, 68, 0.9)',
          fogColor: 'rgba(26, 4, 4, 0.75)',
          rockShadow: '#050000',
          rockHighlight: '#1e0505',
          snowColor: '#ef4444',
          snowIce: '#f97316',
          gridColor: 'rgba(239, 68, 68, 0.15)'
        };
      case 'cosmic':
        return {
          skyColors: ['#010208', '#050921', '#11103c', '#02020a'],
          sunColor: 'rgba(168, 85, 247, 0.85)',
          fogColor: 'rgba(15, 10, 48, 0.75)',
          rockShadow: '#020412',
          rockHighlight: '#0d163a',
          snowColor: '#c084fc',
          snowIce: '#a855f7',
          gridColor: 'rgba(168, 85, 247, 0.18)'
        };
      case 'everest':
      default:
        return {
          skyColors: ['#082f49', '#0369a1', '#0ea5e9', '#bae6fd'],
          sunColor: 'rgba(255, 255, 255, 0.98)',
          fogColor: 'rgba(224, 242, 254, 0.55)',
          rockShadow: '#082f49',
          rockHighlight: '#1e3a8a',
          snowColor: '#ffffff',
          snowIce: '#e0f2fe',
          gridColor: 'rgba(14, 165, 233, 0.15)'
        };
    }
  };

  // Re-init particle buffers when weather states change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 1280;
    canvas.height = 800;

    const count = cosmetics.weather === 'blizzard' || cosmetics.weather === 'storm' ? 320 : 160;
    weatherParticlesRef.current = Array.from({ length: count }, () => {
      const pY = Math.random() * canvas.height;
      return {
        x: Math.random() * canvas.width,
        y: pY,
        vx: cosmetics.weather === 'blizzard' ? -10 - Math.random() * 8 : -3 - Math.random() * 4,
        vy: cosmetics.weather === 'rain' || cosmetics.weather === 'storm' ? 14 + Math.random() * 8 : 3 + Math.random() * 5,
        size: cosmetics.weather === 'blizzard' ? 2 + Math.random() * 3.5 : 1.2 + Math.random() * 2.8,
        color: cosmetics.weather === 'rain' || cosmetics.weather === 'storm' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.95)',
        opacity: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        amplitude: Math.random() * 1.5
      };
    });

    birdsRef.current = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: 80 + Math.random() * 220,
      speedX: 0.9 + Math.random() * 1.5,
      speedY: -0.1 + Math.random() * 0.2,
      size: 7 + Math.random() * 5,
      wingAngle: Math.random() * Math.PI,
      wingDir: 0.06 + Math.random() * 0.08,
      color: cosmetics.theme === 'cyber' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(15, 23, 42, 0.85)'
    }));
  }, [cosmetics.weather, cosmetics.theme]);

  // Handle dynamic trigger transitions (shaking and impact triggers)
  useEffect(() => {
    if (gameState !== prevGameStateRef.current) {
      if (gameState === 'collapsed') {
        cameraRef.current.shake = 32;
      } else if (gameState === 'banked') {
        cameraRef.current.shake = 12;
      } else if (gameState === 'climbing') {
        cameraRef.current.shake = 5;
      }
      prevGameStateRef.current = gameState;
    }
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const palette = getThemePalette();

      // Camera shake physics
      if (cameraRef.current.shake > 0.1) {
        cameraRef.current.shake *= cameraRef.current.shakeDecay;
      } else {
        cameraRef.current.shake = 0;
      }

      const currentShakeX = (Math.random() - 0.5) * cameraRef.current.shake;
      const currentShakeY = (Math.random() - 0.5) * cameraRef.current.shake;

      // Climbing physics velocity
      const climbSpeed = gameState === 'climbing' ? Math.max(3.2, multiplier * 3.8) : 0.65;
      scrollRef.current += climbSpeed;

      ctx.save();
      ctx.translate(currentShakeX, currentShakeY);

      // 1. SKY ATMOSPHERE
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, palette.skyColors[0]);
      skyGrad.addColorStop(0.35, palette.skyColors[1]);
      skyGrad.addColorStop(0.7, palette.skyColors[2]);
      skyGrad.addColorStop(1, palette.skyColors[3]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. COSMIC NEBULAE AND AURORA RIPPLES
      if (cosmetics.theme === 'cosmic' || cosmetics.theme === 'cyber') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        const ribbonCount = cosmetics.theme === 'cosmic' ? 3 : 1;
        for (let r = 0; r < ribbonCount; r++) {
          const auroraGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
          auroraGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
          auroraGrad.addColorStop(0.5, r % 2 === 0 ? 'rgba(6, 182, 212, 0.28)' : 'rgba(236, 72, 153, 0.25)');
          auroraGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

          ctx.strokeStyle = auroraGrad;
          ctx.lineWidth = 45 + r * 15;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width + 10; x += 30) {
            const waveY = 160 + r * 60 + Math.sin(x * 0.003 + t * 0.012 + r * 1.5) * 45;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. DYNAMIC ASTEROIDS / METEORS
      if ((cosmetics.theme === 'volcanic' || cosmetics.theme === 'cosmic') && t % 110 === 0 && Math.random() < 0.45) {
        sparkParticlesRef.current.push({
          x: Math.random() * canvas.width * 0.6 + canvas.width * 0.4,
          y: -10,
          vx: -14 - Math.random() * 8,
          vy: 8 + Math.random() * 6,
          size: 2.5 + Math.random() * 3,
          color: cosmetics.theme === 'volcanic' ? '#ef4444' : '#a855f7',
          life: 0,
          maxLife: 90
        });
      }

      // Update cosmic / volcano fire sparks
      sparkParticlesRef.current.forEach((sp, index) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life += 1;
        
        if (sp.life >= sp.maxLife || sp.y > canvas.height || sp.x < 0) {
          sparkParticlesRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = sp.color;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * (1 - sp.life / sp.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. RETRO SUN AND DYNAMIC GOD-RAYS
      const sunX = 1000 - (scrollRef.current * 0.05) % 300;
      const sunY = 140 + (scrollRef.current * 0.02) % 120;
      
      ctx.save();
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 180);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      sunGrad.addColorStop(0.15, palette.sunColor);
      sunGrad.addColorStop(0.5, cosmetics.theme === 'volcanic' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (cosmetics.theme === 'sunny' || cosmetics.theme === 'everest') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 12;
        const rayAngleStep = Math.PI / 16;
        for (let r = 0; r < 32; r++) {
          const currentAngle = r * rayAngleStep + t * 0.0007;
          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.lineTo(
            sunX + Math.cos(currentAngle) * 900,
            sunY + Math.sin(currentAngle) * 900
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. PARALLAX DEEP BACKGROUND MOUNTAIN LAYERS
      const drawParallaxRange = (
        parallaxSpeed: number,
        baseHeight: number,
        colorStart: string,
        colorEnd: string,
        noiseAmp: number,
        wavePeriod: number,
        iceHighlight: boolean
      ) => {
        const offsetScroll = scrollRef.current * parallaxSpeed;
        ctx.fillStyle = colorStart;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        
        const segmentCount = 40;
        const segmentWidth = canvas.width / segmentCount;
        const terrainPoints: Array<{ x: number; y: number }> = [];

        for (let i = -2; i <= segmentCount + 2; i++) {
          const x = i * segmentWidth;
          const evaluationX = x + offsetScroll;
          const heightNoise = Math.sin(evaluationX * wavePeriod) * noiseAmp +
                             Math.cos(evaluationX * wavePeriod * 2.5) * (noiseAmp * 0.4) +
                             Math.sin(evaluationX * wavePeriod * 5.2) * (noiseAmp * 0.15);
          const y = canvas.height - (baseHeight + heightNoise);
          terrainPoints.push({ x, y });
        }

        ctx.beginPath();
        ctx.moveTo(terrainPoints[0].x, canvas.height);
        terrainPoints.forEach((pt) => {
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        const fillGrad = ctx.createLinearGradient(0, canvas.height - baseHeight - noiseAmp, 0, canvas.height);
        fillGrad.addColorStop(0, colorStart);
        fillGrad.addColorStop(1, colorEnd);
        ctx.fillStyle = fillGrad;
        ctx.fill();

        if (iceHighlight) {
          ctx.fillStyle = palette.snowColor;
          terrainPoints.forEach((pt, idx) => {
            if (idx > 0 && idx < terrainPoints.length - 1 && pt.y < canvas.height - baseHeight + noiseAmp * 0.2) {
              ctx.beginPath();
              ctx.moveTo(pt.x, pt.y);
              ctx.lineTo(pt.x - 18, pt.y + 35);
              ctx.lineTo(pt.x + 18, pt.y + 35);
              ctx.closePath();
              ctx.fill();
            }
          });
        }
      };

      drawParallaxRange(
        0.06,
        480,
        cosmetics.theme === 'cyber' ? '#120224' : '#081730',
        '#020617',
        75,
        0.0018,
        false
      );

      drawParallaxRange(
        0.14,
        340,
        palette.rockShadow,
        palette.rockHighlight,
        110,
        0.0035,
        cosmetics.theme === 'everest' || cosmetics.theme === 'sunny'
      );

      drawParallaxRange(
        0.28,
        210,
        palette.rockHighlight,
        'rgba(15, 23, 42, 0.95)',
        140,
        0.0065,
        cosmetics.theme === 'everest' || cosmetics.theme === 'sunny' || cosmetics.theme === 'cosmic'
      );

      if (scrollRef.current < 1600) {
        const treesFade = Math.max(0, 1 - scrollRef.current / 1600);
        ctx.save();
        ctx.globalAlpha = treesFade;
        
        const count = 15;
        const forestSpeed = 0.45;
        for (let i = 0; i < count; i++) {
          const treeX = ((i * 120 - scrollRef.current * forestSpeed) % (canvas.width + 120)) + (i % 2 === 0 ? 0 : 35);
          const finalX = treeX < -50 ? treeX + canvas.width + 120 : treeX;
          const baseHeightSlope = getSlopeY(finalX, scrollRef.current * forestSpeed);
          
          ctx.fillStyle = cosmetics.theme === 'sunny' ? '#0f4025' : '#111827';
          
          ctx.beginPath();
          ctx.moveTo(finalX, baseHeightSlope - 60);
          ctx.lineTo(finalX - 18, baseHeightSlope);
          ctx.lineTo(finalX + 18, baseHeightSlope);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = cosmetics.theme === 'sunny' ? '#14532d' : '#1e293b';
          ctx.beginPath();
          ctx.moveTo(finalX, baseHeightSlope - 60);
          ctx.lineTo(finalX - 10, baseHeightSlope - 30);
          ctx.lineTo(finalX + 10, baseHeightSlope - 30);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 6. FOREGROUND SNOW & ROCK RAMP
      ctx.fillStyle = palette.rockShadow;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = -20; x <= canvas.width + 40; x += 15) {
        ctx.lineTo(x, getSlopeY(x, scrollRef.current));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = palette.snowColor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 15) {
        const y = getSlopeY(x, scrollRef.current);
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = palette.snowIce;
      ctx.lineWidth = 14;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 30) {
        const y = getSlopeY(x, scrollRef.current) + 12;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (cosmetics.theme === 'sunny') {
        ctx.save();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        for (let x = 10; x < canvas.width; x += 36) {
          const y = getSlopeY(x, scrollRef.current);
          const windShift = Math.sin(t * 0.08 + x * 0.05) * 6;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x - 3 + windShift * 0.5, y - 8, x - 5 + windShift, y - 14);
          ctx.moveTo(x + 3, y);
          ctx.quadraticCurveTo(x + 2 + windShift * 0.5, y - 10, x + windShift, y - 18);
          ctx.moveTo(x - 3, y);
          ctx.quadraticCurveTo(x - 5 + windShift * 0.5, y - 6, x - 8 + windShift, y - 10);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.save();
      const rockSpacing = 220;
      const scrollOffset = scrollRef.current;
      const startIdx = Math.floor(scrollOffset / rockSpacing) - 1;
      const endIdx = startIdx + Math.ceil(canvas.width / rockSpacing) + 2;

      for (let i = startIdx; i <= endIdx; i++) {
        const pseudoRandSize = 13 + Math.abs(Math.sin(i * 743.21)) * 16;
        const pseudoRandOffset = Math.sin(i * 321.09) * 75;
        const rockX = (i * rockSpacing) - scrollOffset + pseudoRandOffset;
        const rockY = getSlopeY(rockX, scrollRef.current);

        if (rockX > -50 && rockX < canvas.width + 50) {
          ctx.save();
          ctx.translate(rockX, rockY);
          ctx.translate(0, pseudoRandSize * 0.15);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.beginPath();
          ctx.ellipse(0, 0, pseudoRandSize * 1.1, pseudoRandSize * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();

          const pts = [
            { x: -pseudoRandSize, y: 0 },
            { x: -pseudoRandSize * 0.7, y: -pseudoRandSize * 0.5 },
            { x: -pseudoRandSize * 0.25, y: -pseudoRandSize * 0.95 },
            { x: pseudoRandSize * 0.35, y: -pseudoRandSize * 0.9 },
            { x: pseudoRandSize * 0.8, y: -pseudoRandSize * 0.35 },
            { x: pseudoRandSize, y: 0 }
          ];

          const lightFromRight = (sunX > rockX);

          ctx.fillStyle = lightFromRight ? '#0f172a' : '#475569';
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          ctx.lineTo(pts[1].x, pts[1].y);
          ctx.lineTo(pts[2].x, pts[2].y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.moveTo(pts[2].x, pts[2].y);
          ctx.lineTo(pts[3].x, pts[3].y);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = lightFromRight ? '#cbd5e1' : '#1e293b';
          ctx.beginPath();
          ctx.moveTo(pts[3].x, pts[3].y);
          ctx.lineTo(pts[4].x, pts[4].y);
          ctx.lineTo(pts[5].x, pts[5].y);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let p = 1; p < pts.length; p++) {
            ctx.lineTo(pts[p].x, pts[p].y);
          }
          ctx.closePath();
          ctx.stroke();

          ctx.restore();
        }
      }
      ctx.restore();

      // =========================================================================
      // DYNAMIC COWS & GOATS GRAZING ALONG THE MOUNTAIN SLOPES
      // =========================================================================
      ctx.save();
      const animalSpacing = 380;
      const animalStartIdx = Math.floor(scrollOffset / animalSpacing) - 1;
      const animalEndIdx = animalStartIdx + Math.ceil(canvas.width / animalSpacing) + 2;

      for (let i = animalStartIdx; i <= animalEndIdx; i++) {
        const hash = Math.abs(Math.sin(i * 123.456 + 789));
        const animalOffset = Math.cos(i * 987.654) * 90;
        const animalX = (i * animalSpacing) - scrollOffset + animalOffset;
        const animalY = getSlopeY(animalX, scrollRef.current);

        if (animalX > -80 && animalX < canvas.width + 80) {
          if (Math.abs(animalX - guyXRef.current) > 75 || gameState !== 'climbing') {
            const animalType = hash < 0.45 ? 'goat' : hash < 0.90 ? 'cow' : 'none';
            const lookingDir = Math.sin(i * 543.21) > 0 ? 1 : -1;
            const chewBob = Math.sin(t * 0.06 + i) * 2;

            if (animalType === 'goat') {
              ctx.save();
              ctx.translate(animalX, animalY);
              ctx.scale(lookingDir, 1);

              ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
              ctx.beginPath();
              ctx.ellipse(0, 2, 16, 5, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(-6, 0); ctx.lineTo(-6, 12);
              ctx.moveTo(-3, 0); ctx.lineTo(-3, 12);
              ctx.moveTo(4, 0); ctx.lineTo(4, 12);
              ctx.moveTo(7, 0); ctx.lineTo(7, 12);
              ctx.stroke();

              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.ellipse(0, -2, 12, 8, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.save();
              ctx.translate(10, -8 + chewBob * 0.6);
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(0, 0, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#cbd5e1';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(0, 4);
              ctx.lineTo(2, 8);
              ctx.stroke();

              ctx.strokeStyle = '#facc15';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.moveTo(-2, -4);
              ctx.quadraticCurveTo(-6, -11, -10, -8);
              ctx.stroke();

              ctx.restore();

              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(-11, -5, 3, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
            } else if (animalType === 'cow') {
              ctx.save();
              ctx.translate(animalX, animalY);
              ctx.scale(lookingDir, 1);

              ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
              ctx.beginPath();
              ctx.ellipse(0, 4, 22, 6, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#1e293b';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(-11, 0); ctx.lineTo(-11, 14);
              ctx.moveTo(-6, 0); ctx.lineTo(-6, 14);
              ctx.moveTo(8, 0); ctx.lineTo(8, 14);
              ctx.moveTo(13, 0); ctx.lineTo(13, 14);
              ctx.stroke();

              ctx.fillStyle = '#fda4af';
              ctx.beginPath();
              ctx.ellipse(0, 3, 5, 4, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#f8fafc'; 
              ctx.fillRect(-18, -14, 34, 18);
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(-18, -14, 34, 18);

              ctx.fillStyle = '#1e293b';
              ctx.beginPath();
              ctx.arc(-10, -8, 5, 0, Math.PI * 2);
              ctx.arc(4, -5, 6, 0, Math.PI * 2);
              ctx.arc(10, -11, 4, 0, Math.PI * 2);
              ctx.arc(-1, -12, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.save();
              ctx.translate(20, -11 + chewBob * 0.7);
              
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(-6, -2, 8, 8);

              ctx.fillRect(-2, -5, 11, 11);
              ctx.strokeRect(-2, -5, 11, 11);

              ctx.fillStyle = '#1e293b';
              ctx.fillRect(0, -4, 4, 4);

              ctx.fillStyle = '#fda4af';
              ctx.fillRect(5, 1, 5, 5);

              ctx.fillStyle = '#f8fafc';
              ctx.beginPath();
              ctx.ellipse(-3, -4, 4, 1.8, -Math.PI/6, 0, Math.PI*2);
              ctx.fill();

              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(2, -5);
              ctx.quadraticCurveTo(4, -10, 6, -9);
              ctx.stroke();

              ctx.fillStyle = '#facc15';
              ctx.strokeStyle = '#d97706';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(-4, 6);
              ctx.lineTo(-7, 12);
              ctx.lineTo(-2, 12);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              ctx.restore();

              const tailShake = Math.sin(t * 0.12 + i) * 3;
              ctx.strokeStyle = '#f8fafc';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-18, -10);
              ctx.quadraticCurveTo(-24 + tailShake, -4, -22 + tailShake, 2);
              ctx.stroke();

              ctx.fillStyle = '#1e293b';
              ctx.beginPath();
              ctx.arc(-22 + tailShake, 2, 2.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
            }
          }
        }
      }
      ctx.restore();

      // 7. ANIMATED WILD BIRDS & SWAYING MOUNTAIN FAUNA
      birdsRef.current.forEach((bird) => {
        bird.x += bird.speedX;
        bird.y += bird.speedY + Math.sin(t * 0.05 + bird.wingAngle) * 0.15;
        bird.wingAngle += bird.wingDir;

        if (bird.x > canvas.width + 50) {
          bird.x = -50;
          bird.y = 80 + Math.random() * 220;
        }

        ctx.save();
        ctx.strokeStyle = bird.color;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        const flapY = Math.sin(bird.wingAngle) * bird.size * 0.72;
        ctx.moveTo(bird.x - bird.size, bird.y + flapY);
        ctx.lineTo(bird.x, bird.y);
        ctx.lineTo(bird.x + bird.size, bird.y + flapY);
        ctx.stroke();
        ctx.restore();
      });

      const goat = goatRef.current;
      if (!goat.active) {
        goat.cooldown--;
        if (goat.cooldown <= 0 && Math.random() < 0.015) {
          goat.active = true;
          goat.dir = Math.random() > 0.5 ? 1 : -1;
          goat.x = goat.dir === 1 ? -60 : canvas.width + 60;
          goat.state = 'walking';
        }
      } else {
        goat.x += goat.dir * 1.1;
        goat.y = getSlopeY(goat.x, scrollRef.current);

        const legSwing = Math.sin(t * 0.16) * 5.5;

        ctx.save();
        ctx.translate(goat.x, goat.y - 18);
        ctx.scale(goat.dir, 1);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(4, -8, 7, Math.PI, Math.PI * 1.6);
        ctx.stroke();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(4, 4); ctx.lineTo(4 + legSwing, 14);
        ctx.moveTo(6, 4); ctx.lineTo(6 - legSwing, 14);
        ctx.moveTo(-5, 4); ctx.lineTo(-5 - legSwing, 14);
        ctx.moveTo(-3, 4); ctx.lineTo(-3 + legSwing, 14);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(8, -6, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(5, -1);
        ctx.lineTo(4, 7);
        ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        if ((goat.dir === 1 && goat.x > canvas.width + 80) || (goat.dir === -1 && goat.x < -80)) {
          goat.active = false;
          goat.cooldown = 180 + Math.random() * 240;
        }
      }

      // =========================================================================
      // PROCEDURAL MILESTONE FLAGS (Continuously generated at intervals)
      // =========================================================================
      const dynamicMilestones: Array<{ mult: number; label: string }> = [];
      const currentInt = Math.floor(multiplier);
      
      const startMark = Math.max(1, currentInt - 3);
      const endMark = currentInt + 6;

      for (let m = startMark; m <= endMark; m++) {
        if (m > 1) {
          dynamicMilestones.push({
            mult: m,
            label: `${m}.00x`
          });
        }
        
        if (m < 10) {
          dynamicMilestones.push({
            mult: m + 0.5,
            label: `${(m + 0.5).toFixed(2)}x`
          });
        }
      }

      if (multiplier < 2.0) {
        dynamicMilestones.push({ mult: 1.50, label: '1.50x' });
      }

      const uniqueMilestones = Array.from(new Map(dynamicMilestones.map(item => [item.mult, item])).values())
        .sort((a, b) => a.mult - b.mult);

      uniqueMilestones.forEach((milestone) => {
        const delta = (milestone.mult - multiplier) * 360;
        const flagX = guyXRef.current + delta;

        if (flagX > -150 && flagX < canvas.width + 150) {
          const flagY = getSlopeY(flagX, scrollRef.current);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(flagX - 12, flagY + 1, 24, 4);

          const poleHeight = 105;
          const poleWidth = 7;
          
          const segs = 10;
          for (let s = 0; s < segs; s++) {
            const isRed = s % 2 === 0;
            ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
            ctx.fillRect(flagX - poleWidth / 2, flagY - (s + 1) * (poleHeight / segs), poleWidth, poleHeight / segs);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(flagX - poleWidth / 2, flagY - (s + 1) * (poleHeight / segs), poleWidth, poleHeight / segs);
          }

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(flagX, flagY - poleHeight - 5, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          const flagWidth = 85;
          const flagHeight = 36;
          const flagTop = flagY - poleHeight + 4;
          const flagColor = milestone.mult % 1 === 0 ? '#ec4899' : '#06b6d4';

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(flagX - 2, flagTop - 2);
          
          for (let fx = 0; fx <= flagWidth + 4; fx += 10) {
            const waveY = flagTop - 2 + Math.sin(fx * 0.05 - t * 0.15) * 3.5;
            ctx.lineTo(flagX - fx, waveY);
          }
          for (let fx = flagWidth + 4; fx >= 0; fx -= 10) {
            const waveY = flagTop + flagHeight + 2 + Math.sin(fx * 0.05 - t * 0.15) * 3.5;
            ctx.lineTo(flagX - fx, waveY);
          }
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = flagColor;
          ctx.beginPath();
          ctx.moveTo(flagX, flagTop);
          
          for (let fx = 0; fx <= flagWidth; fx += 10) {
            const waveY = flagTop + Math.sin(fx * 0.05 - t * 0.15) * 3.5;
            ctx.lineTo(flagX - fx, waveY);
          }
          for (let fx = flagWidth; fx >= 0; fx -= 10) {
            const waveY = flagTop + flagHeight + Math.sin(fx * 0.05 - t * 0.15) * 3.5;
            ctx.lineTo(flagX - fx, waveY);
          }
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(flagX - 2, flagTop + Math.sin(-t * 0.15) * 3.5);
          ctx.lineTo(flagX - 8, flagTop + Math.sin(8 * 0.05 - t * 0.15) * 3.5);
          ctx.lineTo(flagX - 8, flagTop + flagHeight + Math.sin(8 * 0.05 - t * 0.15) * 3.5);
          ctx.lineTo(flagX - 2, flagTop + flagHeight + Math.sin(-t * 0.15) * 3.5);
          ctx.closePath();
          ctx.fill();

          ctx.save();
          ctx.font = 'bold 11px "Press Start 2P", monospace, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textX = flagX - flagWidth / 2 - 2;
          const textY = flagTop + flagHeight / 2 + Math.sin((flagWidth / 2) * 0.05 - t * 0.15) * 3.5;
          const displayLabel = milestone.mult % 1 === 0 ? `${Math.floor(milestone.mult)}x` : `${milestone.mult.toFixed(1)}x`;

          ctx.fillStyle = '#000000';
          ctx.fillText(displayLabel, textX + 1.5, textY + 1.5);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillText(displayLabel, textX, textY);
          ctx.restore();
        }
      });

      // 9. DYNAMIC CAM PANNING FOCUS ON PLAYER
      let targetClimbX = 260;
      if (gameState === 'climbing') {
        targetClimbX = Math.min(950, 260 + (multiplier - 1) * 26);
      } else if (gameState === 'collapsed') {
        targetClimbX = 260;
      } else if (gameState === 'banked') {
        targetClimbX = 850;
      }

      guyXRef.current += (targetClimbX - guyXRef.current) * 0.12;
      const guyBaseY = getSlopeY(guyXRef.current, scrollRef.current);
      
      // Implement leap mechanics: offset the Y value high into the sky if leap is active!
      const leapYOffset = isLeaping ? Math.sin((t * 0.25) % Math.PI) * 110 : 0;
      const bounceBob = gameState === 'climbing' && !isLeaping ? Math.abs(Math.sin(t * 0.28)) * 14 : 0;
      guyYRef.current = guyBaseY - 32 - bounceBob - leapYOffset;

      if (cosmetics.trail !== 'none' && gameState === 'climbing') {
        let trailColor = '#38bdf8';
        if (cosmetics.trail === 'rainbow') {
          trailColor = `hsl(${(t * 5) % 360}, 100%, 65%)`;
        } else if (cosmetics.trail === 'gold') {
          trailColor = '#facc15';
        } else if (cosmetics.trail === 'fire') {
          trailColor = '#f97316';
        } else if (cosmetics.trail === 'neon') {
          trailColor = '#ec4899';
        }

        climberTrailRef.current.push({
          x: guyXRef.current - 12,
          y: guyYRef.current + 18,
          alpha: 1,
          size: isLeaping ? 12 + Math.random() * 12 : 6 + Math.random() * 8, // Draw a thicker, gorgeous shockwave trail during leaps
          color: trailColor,
          vx: -5 - Math.random() * 3,
          vy: 2 + (Math.random() - 0.5) * 3
        });
      }

      climberTrailRef.current.forEach((pt, i) => {
        pt.alpha -= 0.045;
        pt.x += pt.vx;
        pt.y += pt.vy;
        
        if (pt.alpha <= 0) {
          climberTrailRef.current.splice(i, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        
        const sparkGrad = ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, pt.size);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.3, pt.color);
        sparkGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 10. HERO CLIMBER AVATAR RENDERING WITH SLOPE TILT, SQUASH/STRETCH AND SWAY
      ctx.save();
      
      const sampleSlopeY1 = getSlopeY(guyXRef.current - 8, scrollRef.current);
      const sampleSlopeY2 = getSlopeY(guyXRef.current + 8, scrollRef.current);
      const slopeAngle = Math.atan2(sampleSlopeY2 - sampleSlopeY1, 16);

      const stretchAmount = gameState === 'climbing' ? Math.sin(t * 0.28) * 0.12 : 0;
      const scaleX = 1 - stretchAmount;
      const scaleY = 1 + stretchAmount;

      const windSwayAngle = gameState === 'climbing' ? Math.min(0.24, multiplier * 0.015) : 0;

      ctx.translate(guyXRef.current, guyYRef.current + 16);
      ctx.rotate(slopeAngle - windSwayAngle);
      
      // Spin the climber slightly if they are performing an epic leap to look extra stylized!
      if (isLeaping) {
        ctx.rotate(Math.sin(t * 0.15) * 0.35);
      }

      ctx.scale(scaleX, scaleY);
      ctx.translate(0, -16);

      ctx.shadowBlur = 24;
      ctx.shadowColor = cosmetics.climber === 'gold' ? 'rgba(234, 179, 8, 0.85)' :
                        cosmetics.climber === 'neon' ? 'rgba(236, 72, 153, 0.85)' :
                        cosmetics.climber === 'astro' ? 'rgba(56, 189, 248, 0.85)' : 'rgba(239, 68, 68, 0.55)';

      const climberColor = cosmetics.climber === 'gold' ? '#eab308' :
                           cosmetics.climber === 'neon' ? '#ec4899' :
                           cosmetics.climber === 'astro' ? '#e2e8f0' : '#ef4444';

      const capeColor = cosmetics.climber === 'gold' ? '#78350f' :
                        cosmetics.climber === 'neon' ? '#a855f7' :
                        cosmetics.climber === 'astro' ? '#2563eb' : '#dc2626';

      ctx.fillStyle = capeColor;
      ctx.beginPath();
      ctx.moveTo(-12, 6);
      const capeCount = 6;
      for (let c = 0; c <= capeCount; c++) {
        const capeX = -12 - c * 6;
        const capeWaveY = 12 + Math.sin(c * 0.6 - t * 0.32) * 8;
        ctx.lineTo(capeX, capeWaveY);
      }
      ctx.lineTo(-14, 32);
      ctx.closePath();
      ctx.fill();

      if (guyImageRef.current) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
          guyImageRef.current,
          -42,
          -62,
          84,
          118
        );
        ctx.restore();
      } else {
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(0, -15, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, -18, 9, 4);

        ctx.fillStyle = climberColor;
        ctx.fillRect(-12, -4, 24, 30);

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -24, 12, Math.PI, 0);
        ctx.fill();
      }

      const pickaxeSwingAngle = gameState === 'climbing' ? Math.sin(t * 0.22) * 0.65 - 0.2 : -0.3;
      
      ctx.save();
      ctx.translate(10, 4);
      ctx.rotate(pickaxeSwingAngle);
      
      ctx.strokeStyle = '#78350f'; 
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -24);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8'; 
      ctx.beginPath();
      ctx.moveTo(-2, -24);
      ctx.lineTo(14, -28);
      ctx.lineTo(14, -22);
      ctx.lineTo(-2, -20);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, -26);
      ctx.lineTo(18, -32);
      ctx.stroke();

      ctx.restore();

      ctx.restore(); 

      if (gameState === 'climbing' && t % 14 === 0) {
        for (let i = 0; i < 3; i++) {
          sparkParticlesRef.current.push({
            x: guyXRef.current + 22,
            y: guyYRef.current + 8,
            vx: -3 - Math.random() * 4,
            vy: -1 - Math.random() * 5,
            size: 1.5 + Math.random() * 2,
            color: cosmetics.theme === 'cyber' ? '#ec4899' : '#facc15',
            life: 0,
            maxLife: 20 + Math.random() * 15
          });
        }
      }

      // 11. DYNAMIC WEATHER WIND/RAIN/STORM PHYSICAL SYSTEM
      if (cosmetics.weather !== 'clear') {
        if (cosmetics.weather === 'storm') {
          if (!lightningStrikeRef.current.active && Math.random() < 0.007) {
            lightningStrikeRef.current.active = true;
            lightningStrikeRef.current.intensity = 0.95;
            lightningStrikeRef.current.timer = 12;
            cameraRef.current.shake = 18;
          }

          if (lightningStrikeRef.current.active) {
            lightningStrikeRef.current.timer--;
            lightningStrikeRef.current.intensity *= 0.82;
            if (lightningStrikeRef.current.timer <= 0) {
              lightningStrikeRef.current.active = false;
            }

            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${lightningStrikeRef.current.intensity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
          }
        }

        weatherParticlesRef.current.forEach((p) => {
          let speedFactorX = p.vx;
          let speedFactorY = p.vy;

          if (gameState === 'climbing') {
            speedFactorY += climbSpeed * 1.4;
            speedFactorX -= climbSpeed * 1.1;
          }

          p.x += speedFactorX + Math.sin(t * 0.025 + p.phase) * p.amplitude;
          p.y += speedFactorY;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) {
            p.x = canvas.width + 10;
            p.y = Math.random() * canvas.height;
          }

          ctx.save();
          ctx.globalAlpha = p.opacity;

          if (cosmetics.weather === 'rain' || cosmetics.weather === 'storm') {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + speedFactorX * 0.65, p.y + speedFactorY * 0.65);
            ctx.stroke();
          } else if (cosmetics.weather === 'neonrain') {
            ctx.fillStyle = `hsl(${(t * 2.5 + p.x) % 360}, 100%, 65%)`;
            ctx.fillRect(p.x, p.y, 2.4, p.size * 4.5);
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // 12. EXPLOSIVE AVALANCHE COLLAPSE WITH SNOWBALLS TUMBLING DOWN
      if (gameState === 'collapsed') {
        const boomRadius = 140;
        const boomGrad = ctx.createRadialGradient(
          guyXRef.current, guyYRef.current, 5,
          guyXRef.current, guyYRef.current, boomRadius
        );
        boomGrad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
        boomGrad.addColorStop(0.2, 'rgba(249, 115, 22, 0.8)');
        boomGrad.addColorStop(0.6, 'rgba(253, 224, 71, 0.45)');
        boomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = boomGrad;
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYRef.current, boomRadius, 0, Math.PI * 2);
        ctx.fill();

        const avalancheColor = cosmetics.theme === 'cyber' ? '#ec4899' : '#ffffff';
        ctx.fillStyle = avalancheColor;
        ctx.strokeStyle = cosmetics.theme === 'cyber' ? '#00ffff' : '#cbd5e1';
        ctx.lineWidth = 4;

        for (let b = 1; b <= 3; b++) {
          const ballAge = t % 40;
          const angleOffset = (b * Math.PI) / 3;
          const fallingDistance = ballAge * 10;
          
          const ballX = guyXRef.current - 40 + (b * 40) + Math.cos(angleOffset) * (fallingDistance * 0.3);
          const ballY = guyYRef.current - 10 + fallingDistance + (ballAge * ballAge * 0.12);

          ctx.save();
          ctx.shadowColor = cosmetics.theme === 'cyber' ? '#ec4899' : 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 15;

          ctx.beginPath();
          ctx.arc(ballX, ballY, 28 - b * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.fillStyle = palette.fogColor;
      ctx.fillRect(0, canvas.height - 110, canvas.width, 110);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [multiplier, gameState, cosmetics, isLeaping]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
      <canvas
        ref={canvasRef}
        className="w-full aspect-[1.6/1] min-h-[500px] md:min-h-[640px] max-h-[800px] object-cover block"
      />
      <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full text-slate-300 pointer-events-none capitalize">
        Theme: {cosmetics.theme} ({cosmetics.weather})
      </div>
    </div>
  );
};