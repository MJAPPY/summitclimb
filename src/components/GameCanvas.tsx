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
  
  // Flying birds state engine
  const birdsRef = useRef<Array<{ x: number; y: number; speedX: number; speedY: number; size: number; wingAngle: number; wingDir: number }>>([]);
  
  // Mountain goat state engine
  const goatRef = useRef<{ x: number; active: boolean; timer: number; direction: number }>({
    x: 0,
    active: false,
    timer: 0,
    direction: 1
  });

  const guyYOffsetRef = useRef<number>(420);
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
        return {
          bgGradStart: '#0284c7', // Deep blue sky
          bgGradMid: '#38bdf8',  // Crisp sky blue
          bgGradEnd: '#bae6fd',   // Soft warm light on horizon
          mountainFar: '#1e293b',
          mountainMid: '#334155',
          mountainNear: '#1e293b',
          snowColor: '#ffffff',
          accentColor: '#f59e0b',  // Golden sun rays
          snowCrust: '#f1f5f9',
        };
      case 'rain':
        return {
          bgGradStart: '#0f172a',
          bgGradMid: '#1e293b',
          bgGradEnd: '#334155',
          mountainFar: '#020617',
          mountainMid: '#0f172a',
          mountainNear: '#111827',
          snowColor: '#94a3b8',
          accentColor: '#38bdf8',
          snowCrust: '#64748b',
        };
      case 'cyber':
        return {
          bgGradStart: '#060112',
          bgGradMid: '#120224',
          bgGradEnd: '#010005',
          mountainFar: '#120024',
          mountainMid: '#1e0038',
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
          mountainFar: '#1a0101',
          mountainMid: '#2d0202',
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
          mountainFar: '#081026',
          mountainMid: '#0e1b3d',
          mountainNear: '#020617',
          snowColor: '#e9d5ff',
          accentColor: '#a855f7',
          snowCrust: '#c084fc',
        };
      case 'everest':
      default:
        return {
          bgGradStart: '#0ea5e9', // Majestic bright azure
          bgGradMid: '#38bdf8',  // Crisp alpine sky
          bgGradEnd: '#e0f2fe',   // Sunny glowing snowy horizon
          mountainFar: '#0f172a',
          mountainMid: '#1e293b',
          mountainNear: '#111827',
          snowColor: '#ffffff',
          accentColor: '#f59e0b',  // Vibrant golden sunshine
          snowCrust: '#f8fafc',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Significantly increased coordinate resolution for an extremely tall panoramic aspect
    canvas.width = 1280; 
    canvas.height = 800;

    // Build wind particles
    particlesRef.current = [];
    const count = cosmetics.weather === 'blizzard' || cosmetics.weather === 'storm' ? 240 : 110;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedY: 2 + Math.random() * 4,
        speedX: -2 - Math.random() * 4,
        size: 1 + Math.random() * 3,
        color: cosmetics.weather === 'rain' || cosmetics.weather === 'storm' ? 'rgba(156, 163, 175, 0.4)' : '#ffffff',
        alpha: 0.2 + Math.random() * 0.8
      });
    }

    // Populate initial flying birds
    birdsRef.current = [];
    for (let b = 0; b < 4; b++) {
      birdsRef.current.push({
        x: Math.random() * canvas.width,
        y: 60 + Math.random() * 120,
        speedX: 0.8 + Math.random() * 1.2,
        speedY: -0.15 + Math.random() * 0.3,
        size: 6 + Math.random() * 4,
        wingAngle: Math.random() * Math.PI,
        wingDir: 0.08 + Math.random() * 0.08
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

      // Sky Twilight/Sunny Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, themeColors.bgGradStart);
      skyGrad.addColorStop(0.5, themeColors.bgGradMid);
      skyGrad.addColorStop(1, themeColors.bgGradEnd);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // SUNNY & SWISS ALPS Presets
      if (cosmetics.theme === 'sunny' || cosmetics.theme === 'everest') {
        const sunX = 1050 - (verticalScrollRef.current * 0.04) % 150;
        const sunY = 120 + (verticalScrollRef.current * 0.01) % 50;

        // Draw Sun Core
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 120);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        sunGrad.addColorStop(0.1, 'rgba(254, 240, 138, 0.9)');
        sunGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.25)');
        sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
        ctx.fill();

        // Solar rays
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 5;
        for (let r = 0; r < 8; r++) {
          ctx.rotate(Math.PI / 4 + t * 0.001);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 360);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Twinkling stars
      if (cosmetics.theme !== 'sunny' && cosmetics.theme !== 'everest' && cosmetics.theme !== 'rain') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 75; i++) {
          const starX = (i * 97 - verticalScrollRef.current * 0.1) % canvas.width;
          const starY = (i * 47 + verticalScrollRef.current * 0.05) % (canvas.height - 180);
          const starSize = 0.5 + Math.abs(Math.sin((t + i * 8) * 0.04)) * 1.5;
          ctx.fillRect(starX >= 0 ? starX : starX + canvas.width, starY, starSize, starSize);
        }
      }

      // Overcast Clouds scrolling for Rain/Everest scenery
      if (cosmetics.theme === 'rain' || cosmetics.theme === 'everest') {
        ctx.fillStyle = cosmetics.theme === 'rain' ? 'rgba(71, 85, 105, 0.25)' : 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 5; i++) {
          const cloudX = (i * 320 - verticalScrollRef.current * 0.2) % (canvas.width + 300);
          const finalCloudX = cloudX < -200 ? cloudX + canvas.width + 400 : cloudX;
          ctx.beginPath();
          ctx.arc(finalCloudX, 60 + i * 20, 35, 0, Math.PI * 2);
          ctx.arc(finalCloudX + 30, 50 + i * 20, 45, 0, Math.PI * 2);
          ctx.arc(finalCloudX - 30, 65 + i * 20, 30, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Flying birds
      if (cosmetics.theme === 'everest' || cosmetics.theme === 'sunny') {
        birdsRef.current.forEach((bird) => {
          bird.x += bird.speedX;
          bird.y += bird.speedY + Math.sin(t * 0.04 + bird.wingAngle) * 0.1;
          bird.wingAngle += bird.wingDir;

          if (bird.x > canvas.width + 50) {
            bird.x = -50;
            bird.y = 60 + Math.random() * 120;
          }

          ctx.save();
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          const flapY = Math.sin(bird.wingAngle) * bird.size * 0.7;
          ctx.moveTo(bird.x - bird.size, bird.y + flapY);
          ctx.lineTo(bird.x, bird.y);
          ctx.lineTo(bird.x + bird.size, bird.y + flapY);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Far Mountains Silhouette
      ctx.fillStyle = themeColors.mountainFar;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const farScrollX = (verticalScrollRef.current * 0.12) % canvas.width;
      const farScrollY = (verticalScrollRef.current * 0.08) % 450;
      for (let x = -40; x <= canvas.width + 40; x += 20) {
        const testX = x + farScrollX;
        const mountainWave = Math.sin(testX * 0.005) * 80 + Math.cos(testX * 0.015) * 40 + Math.sin(testX * 0.03) * 15;
        const finalHeight = 420 + mountainWave - farScrollY;
        ctx.lineTo(x, canvas.height - Math.max(10, finalHeight));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Detailed Mountain Ridges
      ctx.fillStyle = themeColors.mountainMid;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const midScrollX = (verticalScrollRef.current * 0.28) % canvas.width;
      const midScrollY = (verticalScrollRef.current * 0.18) % 380;
      
      const midPoints: Array<{ x: number; y: number }> = [];
      for (let x = -30; x <= canvas.width + 30; x += 15) {
        const testX = x + midScrollX;
        const wave = Math.sin(testX * 0.008) * 65 + Math.cos(testX * 0.02) * 30;
        const finalHeight = 320 + wave - midScrollY;
        midPoints.push({ x, y: canvas.height - Math.max(10, finalHeight) });
      }

      midPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Mid peak highlights
      ctx.fillStyle = themeColors.snowCrust;
      midPoints.forEach((pt, idx) => {
        if (idx > 0 && idx < midPoints.length - 1 && pt.y < 620) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - 16, pt.y + 24);
          ctx.lineTo(pt.x + 16, pt.y + 24);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Pine trees cluster
      if (verticalScrollRef.current < 950) {
        const treesFade = Math.max(0, 1 - verticalScrollRef.current / 950);
        ctx.save();
        ctx.globalAlpha = treesFade;
        ctx.fillStyle = cosmetics.theme === 'sunny' ? '#14532d' : '#064e3b';
        const forestScrollX = verticalScrollRef.current * 0.35;
        const forestScrollY = verticalScrollRef.current * 0.15;
        for (let i = 0; i < 12; i++) {
          const treeX = 180 + i * 55 - forestScrollX;
          const treeY = canvas.height - 35 + forestScrollY;
          ctx.beginPath();
          ctx.moveTo(treeX, treeY - 50);
          ctx.lineTo(treeX - 16, treeY);
          ctx.lineTo(treeX + 16, treeY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // NEAR SNOW/ROCK SLOPE
      const getSlopeY = (x: number) => {
        const baseHeight = 150 + x * 0.42;
        const waveScroll = Math.sin((x + verticalScrollRef.current * 0.5) * 0.012) * 16;
        return canvas.height - (baseHeight + waveScroll);
      };

      // Draw Ground
      ctx.fillStyle = themeColors.mountainNear;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = -20; x <= canvas.width + 40; x += 10) {
        ctx.lineTo(x, getSlopeY(x));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw snow line
      ctx.strokeStyle = themeColors.snowColor;
      ctx.lineWidth = 7;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 10) {
        if (x === -20) ctx.moveTo(x, getSlopeY(x));
        else ctx.lineTo(x, getSlopeY(x));
      }
      ctx.stroke();

      // Secondary layered ice shading
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 15) {
        if (x === -20) ctx.moveTo(x, getSlopeY(x) + 10);
        else ctx.lineTo(x, getSlopeY(x) + 10);
      }
      ctx.stroke();

      // Mountain Goat
      if (cosmetics.theme === 'everest' || cosmetics.theme === 'sunny') {
        const goat = goatRef.current;
        if (!goat.active) {
          goat.timer++;
          if (goat.timer > 400 && Math.random() < 0.012) {
            goat.active = true;
            goat.direction = Math.random() > 0.5 ? 1 : -1;
            goat.x = goat.direction === 1 ? -60 : canvas.width + 60;
            goat.timer = 0;
          }
        } else {
          goat.x += goat.direction * 0.85;
          const goatY = getSlopeY(goat.x);

          ctx.save();
          ctx.translate(goat.x, goatY - 14); 
          ctx.scale(goat.direction, 1);

          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(3, -6, 6, Math.PI, Math.PI * 1.5);
          ctx.stroke();

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.5;
          const legBob = Math.sin(t * 0.12) * 3.5;
          ctx.beginPath();
          ctx.moveTo(3, 3); ctx.lineTo(3 + legBob, 12);
          ctx.moveTo(5, 3); ctx.lineTo(5 - legBob, 12);
          ctx.moveTo(-5, 3); ctx.lineTo(-5 - legBob, 12);
          ctx.moveTo(-3, 3); ctx.lineTo(-3 + legBob, 12);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(6, -5, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(7, -6, 0.9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(3, -1);
          ctx.lineTo(2, 5);
          ctx.lineTo(5, 3);
          ctx.closePath();
          ctx.fill();

          ctx.restore();

          if ((goat.direction === 1 && goat.x > canvas.width + 80) || 
              (goat.direction === -1 && goat.x < -80)) {
            goat.active = false;
          }
        }
      }

      // Milestone flags - RETRO 8-BIT STYLE WITH ARCADE PRESS START 2P FONTS
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
        const baseOffset = (milestone.mult - multiplier) * 340;
        const flagX = guyXRef.current + baseOffset;
        
        if (flagX > -120 && flagX < canvas.width + 120) {
          const flagY = getSlopeY(flagX);

          // Retro Pixel Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(flagX - 10, flagY + 1, 20, 4);

          // 8-bit Striped Caution Flagpole
          const poleWidth = 6;
          const poleHeight = 95; // Increased slightly for taller flag size
          const segmentHeight = 10;
          
          for (let pY = 0; pY < poleHeight; pY += segmentHeight) {
            const isRed = (Math.floor(pY / segmentHeight) % 2 === 0);
            ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
            ctx.fillRect(flagX - poleWidth / 2, flagY - pY - segmentHeight, poleWidth, segmentHeight);
            
            // Retro Black Outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(flagX - poleWidth / 2, flagY - pY - segmentHeight, poleWidth, segmentHeight);
          }

          // Pixel block ornament at top of pole
          ctx.fillStyle = '#facc15';
          ctx.fillRect(flagX - 5, flagY - poleHeight - 8, 10, 8);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(flagX - 5, flagY - poleHeight - 8, 10, 8);

          // Blocky Rectangular Flag Shape
          const isWholeNumber = milestone.mult % 1 === 0;
          const flagColor = isWholeNumber ? '#ec4899' : '#06b6d4'; // Hot Pink or Neon Cyan
          const flagTop = flagY - poleHeight + 4;
          const flagHeight = 34; // Larger height to host big numbers
          const flagWidth = 85;  // Larger width to prevent text overflow
          
          // Outer Flag Border
          ctx.fillStyle = '#000000';
          ctx.fillRect(flagX - flagWidth - 2, flagTop - 2, flagWidth + 4, flagHeight + 4);

          // Inner flag color
          ctx.fillStyle = flagColor;
          ctx.fillRect(flagX - flagWidth, flagTop, flagWidth, flagHeight);

          // Classic 90s warning stripe pattern on the left edge of the flag
          ctx.fillStyle = '#facc15';
          ctx.fillRect(flagX - 8, flagTop, 4, flagHeight);
          ctx.fillStyle = '#000000';
          ctx.fillRect(flagX - 4, flagTop, 2, flagHeight);

          // DRAW RETRO TYPOGRAPHY NUMBERS INSIDE THE FLAG
          ctx.save();
          // Uses standard custom-injected arcade Press Start 2P imported font with larger size
          ctx.font = 'bold 12px "Press Start 2P", monospace, sans-serif'; 
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Authentic retro double dropshadow effect
          const textX = flagX - flagWidth / 2 - 2;
          const textY = flagTop + flagHeight / 2 + 1;
          const displayLabel = isWholeNumber ? `${Math.floor(milestone.mult)}x` : `${milestone.mult}x`;

          // Black Shadow layer 1
          ctx.fillStyle = '#000000';
          ctx.fillText(displayLabel, textX + 1.5, textY + 1.5);
          // Neon Glow back layer
          ctx.fillStyle = isWholeNumber ? '#a855f7' : '#0891b2';
          ctx.fillText(displayLabel, textX - 0.5, textY - 0.5);
          // Foreground Crisp text
          ctx.fillStyle = '#ffffff';
          ctx.fillText(displayLabel, textX, textY);
          
          ctx.restore();
        }
      });

      // GUY CLIMBER position
      let targetX = 260;
      if (gameState === 'climbing') {
        targetX = Math.min(950, 260 + (multiplier - 1) * 26);
      } else if (gameState === 'collapsed') {
        targetX = 260;
      } else if (gameState === 'banked') {
        targetX = 850;
      }

      guyXRef.current += (targetX - guyXRef.current) * 0.1;
      const guyBaseY = getSlopeY(guyXRef.current);

      const climbBob = gameState === 'climbing' ? Math.abs(Math.sin(t * 0.24)) * 16 : 0;
      guyYOffsetRef.current = guyBaseY - 32 - climbBob;

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
          x: guyXRef.current + (Math.random() * 12 - 6),
          y: guyYOffsetRef.current + 22 + (Math.random() * 12 - 6),
          alpha: 1,
          color: trailColor,
        });
      }

      climberTrailRef.current.forEach((pt, i) => {
        pt.alpha -= 0.05;
        pt.x -= (gameState === 'climbing' ? 3.5 : 0.8);
        pt.y += (gameState === 'climbing' ? 1.0 : 0.25);
        if (pt.alpha <= 0) {
          climberTrailRef.current.splice(i, 1);
          return;
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // DRAW SUPERHERO CLIMBER GUY
      ctx.save();
      ctx.shadowBlur = 22;
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
      ctx.moveTo(guyXRef.current - 10, guyYOffsetRef.current + 5);
      const capeWaveX = guyXRef.current - 32 - (gameState === 'climbing' ? Math.sin(t * 0.3) * 10 : Math.sin(t * 0.1) * 5);
      const capeWaveY = guyYOffsetRef.current + 16 + Math.cos(t * 0.2) * 8;
      ctx.lineTo(capeWaveX, capeWaveY);
      ctx.lineTo(guyXRef.current - 12, guyYOffsetRef.current + 28);
      ctx.closePath();
      ctx.fill();

      if (guyImageRef.current) {
        ctx.save();
        ctx.translate(guyXRef.current, guyYOffsetRef.current);
        ctx.scale(-1, 1);
        ctx.drawImage(
          guyImageRef.current,
          -40,
          -60,
          80,
          115
        );
        ctx.restore();
      } else {
        // High quality fallback vector: Facing Right
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 15, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(guyXRef.current + 1, guyYOffsetRef.current - 19, 9, 4);

        ctx.fillStyle = climberColor;
        ctx.fillRect(guyXRef.current - 11, guyYOffsetRef.current - 5, 22, 28);

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 24, 12, Math.PI, 0);
        ctx.fill();

        ctx.strokeStyle = climberColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(guyXRef.current + 11, guyYOffsetRef.current + 3);
        const rightArmFlex = gameState === 'climbing' ? Math.sin(t * 0.2) * 8 : 0;
        ctx.lineTo(guyXRef.current + 22, guyYOffsetRef.current - 3 + rightArmFlex);
        ctx.stroke();
      }

      ctx.restore();

      // WEATHER WIND AND METEOROLOGICAL ENGINE
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
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + dragX * 0.6, p.y + dragY * 0.6);
            ctx.stroke();
          } else if (cosmetics.weather === 'neonrain') {
            ctx.fillStyle = `hsl(${(t * 2 + p.x) % 360}, 100%, 65%)`;
            ctx.fillRect(p.x, p.y, 2.2, p.size * 4);
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
          guyXRef.current, guyYOffsetRef.current, 8,
          guyXRef.current, guyYOffsetRef.current, 120
        );
        boomGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
        boomGradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
        boomGradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = boomGradient;
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current, 125, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#cbd5e1';
        for (let i = 0; i < 12; i++) {
          const debrisX = guyXRef.current - (t % 20) * 4 + Math.sin(i) * 45;
          const debrisY = guyYOffsetRef.current + (t % 20) * 2;
          ctx.fillRect(debrisX, debrisY, 18, 12);
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
        className="w-full aspect-[1.6/1] min-h-[500px] md:min-h-[640px] max-h-[800px] object-cover block"
      />
      <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full text-slate-300 pointer-events-none capitalize">
        Theme: {cosmetics.theme} ({cosmetics.weather})
      </div>
    </div>
  );
};