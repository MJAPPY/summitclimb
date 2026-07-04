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
          skyColors: ['#0f172a', '#1e293b', '#38bdf8', '#fed7aa'],
          sunColor: 'rgba(253, 224, 71, 0.95)',
          fogColor: 'rgba(240, 249, 255, 0.45)',
          rockShadow: '#0f172a',
          rockHighlight: '#475569',
          snowColor: '#ffffff',
          snowIce: '#cbd5e1',
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
          gridColor: 'rgba(148, 163, 184, 0.08)'
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
    
    // Configure crisp double-density sizing for high resolution Retina screens
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
      color: cosmetics.theme === 'cyber' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(15, 23, 42, 0.65)'
    }));
  }, [cosmetics.weather, cosmetics.theme]);

  // Handle dynamic trigger transitions (shaking and impact triggers)
  useEffect(() => {
    if (gameState !== prevGameStateRef.current) {
      if (gameState === 'collapsed') {
        cameraRef.current.shake = 32; // Forceful avalanche camera rumble!
      } else if (gameState === 'banked') {
        cameraRef.current.shake = 12; // Gold win rumble flash
      } else if (gameState === 'climbing') {
        cameraRef.current.shake = 5; // Launch rocket engine kick
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

      // 1. SKY ATMOSPHERE (High-quality procedural multi-stop linear color blending)
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
        
        // Fluid, looping mathematical auroral ribbon
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

      // 3. DYNAMIC ASTEROIDS / METEORS (For Volcanic & Cosmic themes)
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

      // 4. RETRO SUN AND DYNAMIC GOD-RAYS (Shining down through mountains)
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

      // Atmospheric God rays
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

      // 5. PARALLAX DEEP BACKGROUND MOUNTAIN LAYERS (proc-generated high-fidelity ridges)
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

        // Draw mountain body
        ctx.beginPath();
        ctx.moveTo(terrainPoints[0].x, canvas.height);
        terrainPoints.forEach((pt) => {
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        // Shaded side color mesh
        const fillGrad = ctx.createLinearGradient(0, canvas.height - baseHeight - noiseAmp, 0, canvas.height);
        fillGrad.addColorStop(0, colorStart);
        fillGrad.addColorStop(1, colorEnd);
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Draw snowy peaks highlights
        if (iceHighlight) {
          ctx.fillStyle = palette.snowColor;
          terrainPoints.forEach((pt, idx) => {
            if (idx > 0 && idx < terrainPoints.length - 1 && pt.y < canvas.height - baseHeight + noiseAmp * 0.2) {
              // Smooth peak cap triangle
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

      // Far silhouette ridge
      drawParallaxRange(
        0.06,
        480,
        cosmetics.theme === 'cyber' ? '#120224' : '#081730',
        '#020617',
        75,
        0.0018,
        false
      );

      // Distant secondary high peaks
      drawParallaxRange(
        0.14,
        340,
        palette.rockShadow,
        palette.rockHighlight,
        110,
        0.0035,
        cosmetics.theme === 'everest' || cosmetics.theme === 'sunny'
      );

      // Mid peak terrain level
      drawParallaxRange(
        0.28,
        210,
        palette.rockHighlight,
        'rgba(15, 23, 42, 0.95)',
        140,
        0.0065,
        cosmetics.theme === 'everest' || cosmetics.theme === 'sunny' || cosmetics.theme === 'cosmic'
      );

      // Pine forests with individual tree animations
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
          
          // Pine color based on lighting theme
          ctx.fillStyle = cosmetics.theme === 'sunny' ? '#0f4025' : '#111827';
          
          ctx.beginPath();
          ctx.moveTo(finalX, baseHeightSlope - 60);
          ctx.lineTo(finalX - 18, baseHeightSlope);
          ctx.lineTo(finalX + 18, baseHeightSlope);
          ctx.closePath();
          ctx.fill();

          // Highlight layered crown
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

      // 6. FOREGROUND SNOW & ROCK RAMP (PROCEDURAL SLOPE COLLISION TARGET)
      ctx.fillStyle = palette.rockShadow;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = -20; x <= canvas.width + 40; x += 15) {
        ctx.lineTo(x, getSlopeY(x, scrollRef.current));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Gleaming crust surface lines
      ctx.strokeStyle = palette.snowColor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 15) {
        const y = getSlopeY(x, scrollRef.current);
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary ice frost shading lines (Gives massive crisp look)
      ctx.strokeStyle = palette.snowIce;
      ctx.lineWidth = 14;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 30) {
        const y = getSlopeY(x, scrollRef.current) + 12;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

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

      // Interactive Mountain Goat Physics (Idle walking/grazing cycle along the slope)
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

        // Animated leg cycle bobbing math
        const legSwing = Math.sin(t * 0.16) * 5.5;

        ctx.save();
        ctx.translate(goat.x, goat.y - 18);
        ctx.scale(goat.dir, 1);

        // Horns
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(4, -8, 7, Math.PI, Math.PI * 1.6);
        ctx.stroke();

        // Animated Legs
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(4, 4); ctx.lineTo(4 + legSwing, 14);
        ctx.moveTo(6, 4); ctx.lineTo(6 - legSwing, 14);
        ctx.moveTo(-5, 4); ctx.lineTo(-5 - legSwing, 14);
        ctx.moveTo(-3, 4); ctx.lineTo(-3 + legSwing, 14);
        ctx.stroke();

        // Fur Body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(8, -6, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Beard
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(5, -1);
        ctx.lineTo(4, 7);
        ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Terminate active goat boundary check
        if ((goat.dir === 1 && goat.x > canvas.width + 80) || (goat.dir === -1 && goat.x < -80)) {
          goat.active = false;
          goat.cooldown = 180 + Math.random() * 240;
        }
      }

      // 8. MILestone Flags With Smooth Wave Flapping Vector Calculations
      const milestones = [
        { mult: 1.5, label: '1.5x' },
        { mult: 2.0, label: '2.0x' },
        { mult: 3.0, label: '3.0x' },
        { mult: 5.0, label: '5.0x' },
        { mult: 10.0, label: '10.0x' },
        { mult: 15.0, label: '15.0x' },
        { mult: 25.0, label: '25.0x' },
      ];

      milestones.forEach((milestone) => {
        const delta = (milestone.mult - multiplier) * 360;
        const flagX = guyXRef.current + delta;

        if (flagX > -150 && flagX < canvas.width + 150) {
          const flagY = getSlopeY(flagX, scrollRef.current);

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(flagX - 12, flagY + 1, 24, 4);

          // High resolution striped pole
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

          // Top pole brass ball
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(flagX, flagY - poleHeight - 5, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Flapping flag math (Sinusoidal coordinate shift for 3D simulation)
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

          // Inner flag flap fill
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

          // Retro Caution Stripe on the left of flag
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(flagX - 2, flagTop + Math.sin(-t * 0.15) * 3.5);
          ctx.lineTo(flagX - 8, flagTop + Math.sin(8 * 0.05 - t * 0.15) * 3.5);
          ctx.lineTo(flagX - 8, flagTop + flagHeight + Math.sin(8 * 0.05 - t * 0.15) * 3.5);
          ctx.lineTo(flagX - 2, flagTop + flagHeight + Math.sin(-t * 0.15) * 3.5);
          ctx.closePath();
          ctx.fill();

          // Milestone typography
          ctx.save();
          ctx.font = 'bold 11px "Press Start 2P", monospace, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textX = flagX - flagWidth / 2 - 2;
          const textY = flagTop + flagHeight / 2 + Math.sin((flagWidth / 2) * 0.05 - t * 0.15) * 3.5;
          const displayLabel = milestone.mult % 1 === 0 ? `${Math.floor(milestone.mult)}x` : `${milestone.mult}x`;

          // Drop shadow double layer
          ctx.fillStyle = '#000000';
          ctx.fillText(displayLabel, textX + 1.5, textY + 1.5);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillText(displayLabel, textX, textY);
          ctx.restore();
        }
      });

      // 9. DYNAMIC CAM PANNING FOCUS ON PLAYER (Standardizing responsive offsets)
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
      
      const bounceBob = gameState === 'climbing' ? Math.abs(Math.sin(t * 0.28)) * 14 : 0;
      guyYRef.current = guyBaseY - 32 - bounceBob;

      // Draw custom jet trail
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

        // Push continuous spark trail
        climberTrailRef.current.push({
          x: guyXRef.current - 12,
          y: guyYRef.current + 18,
          alpha: 1,
          size: 6 + Math.random() * 8,
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
        
        // Multi-colored combustion layers inside fire jet
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

      // 10. HERO CLIMBER AVATAR RENDERING WITH CAPE VECTOR OSCILLATIONS
      ctx.save();
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

      // Advanced Fluttering Cape wave simulation
      ctx.fillStyle = capeColor;
      ctx.beginPath();
      ctx.moveTo(guyXRef.current - 12, guyYRef.current + 6);
      
      const capeCount = 6;
      for (let c = 0; c <= capeCount; c++) {
        const capeX = guyXRef.current - 12 - c * 6;
        const capeWaveY = guyYRef.current + 12 + Math.sin(c * 0.6 - t * 0.32) * 8;
        ctx.lineTo(capeX, capeWaveY);
      }
      ctx.lineTo(guyXRef.current - 14, guyYRef.current + 32);
      ctx.closePath();
      ctx.fill();

      if (guyImageRef.current) {
        ctx.save();
        ctx.translate(guyXRef.current, guyYRef.current);
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
        // High fidelity vector climberfallback
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYRef.current - 15, 11, 0, Math.PI * 2);
        ctx.fill();

        // Goggles
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(guyXRef.current + 2, guyYRef.current - 18, 9, 4);

        // Body suit
        ctx.fillStyle = climberColor;
        ctx.fillRect(guyXRef.current - 12, guyYRef.current - 4, 24, 30);

        // Head helmet crown
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYRef.current - 24, 12, Math.PI, 0);
        ctx.fill();

        // Arm flexing
        ctx.strokeStyle = climberColor;
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(guyXRef.current + 12, guyYRef.current + 4);
        const rightArmBob = gameState === 'climbing' ? Math.sin(t * 0.25) * 8 : 0;
        ctx.lineTo(guyXRef.current + 24, guyYRef.current - 4 + rightArmBob);
        ctx.stroke();
      }
      ctx.restore();

      // Continuous pickaxe impact sparks
      if (gameState === 'climbing' && t % 3 === 0) {
        for (let i = 0; i < 3; i++) {
          sparkParticlesRef.current.push({
            x: guyXRef.current + 18,
            y: guyYRef.current + 10,
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
        // Lightning event generator in Storm mode
        if (cosmetics.weather === 'storm') {
          if (!lightningStrikeRef.current.active && Math.random() < 0.007) {
            lightningStrikeRef.current.active = true;
            lightningStrikeRef.current.intensity = 0.95;
            lightningStrikeRef.current.timer = 12;
            cameraRef.current.shake = 18; // Thunder rumble!
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

          // Reposition offscreen particles
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
            // Smooth velocity raindrops
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
            // Flurry snow flakes
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // 12. EXPLOSIVE AVALANCHE AESTHETIC COLLAPSE GEYSER
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

        // Procedural heavy tumbling snowball boulders
        ctx.fillStyle = cosmetics.theme === 'cyber' ? '#ec4899' : '#ffffff';
        const boulderCount = 20;
        for (let b = 0; b < boulderCount; b++) {
          const boulderAge = t % 25;
          const boulderAngle = (b / boulderCount) * Math.PI * 2 + t * 0.05;
          const distance = boulderAge * 6.5;
          const boulderX = guyXRef.current + Math.cos(boulderAngle) * distance;
          const boulderY = guyYRef.current + Math.sin(boulderAngle) * distance + (boulderAge * boulderAge * 0.15); // Gravity pull

          ctx.beginPath();
          ctx.arc(boulderX, boulderY, 10 + Math.sin(b) * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Atmospheric fog filter (Blends deep layers dynamically)
      ctx.fillStyle = palette.fogColor;
      ctx.fillRect(0, canvas.height - 110, canvas.width, 110);

      ctx.restore(); // end camera shake translation

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
        className="w-full aspect-[1.6/1] min-h-[500px] md:min-h-[640px] max-h-[800px] object-cover block"
      />
      <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full text-slate-300 pointer-events-none capitalize">
        Theme: {cosmetics.theme} ({cosmetics.weather})
      </div>
    </div>
  );
};