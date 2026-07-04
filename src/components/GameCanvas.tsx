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
        // Updated "Swiss Alps" preset: Beautiful sparkling alpine morning sunshine with vibrant blue gradient sky
        return {
          bgGradStart: '#0ea5e9', // Majestic bright azure
          bgGradMid: '#38bdf8',  // Crisp alpine sky
          bgGradEnd: '#e0f2fe',   // Sunny glowing snowy horizon
          mountainFar: '#1e293b',
          mountainMid: '#475569',
          mountainNear: '#334155',
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

    // Populate initial flying birds
    birdsRef.current = [];
    for (let b = 0; b < 3; b++) {
      birdsRef.current.push({
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * 80,
        speedX: 0.8 + Math.random() * 1.2,
        speedY: -0.15 + Math.random() * 0.3,
        size: 5 + Math.random() * 3,
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

      // Realistic Sky Twilight/Sunny Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, themeColors.bgGradStart);
      skyGrad.addColorStop(0.5, themeColors.bgGradMid);
      skyGrad.addColorStop(1, themeColors.bgGradEnd);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // SUNNY & SWISS ALPS Presets: Volumetric solar flares, sun burst rays and detailed atmosphere
      if (cosmetics.theme === 'sunny' || cosmetics.theme === 'everest') {
        const sunX = 750 - (verticalScrollRef.current * 0.04) % 150;
        const sunY = 80 + (verticalScrollRef.current * 0.01) % 50;

        // Draw Sun Core
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 90);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        sunGrad.addColorStop(0.1, 'rgba(254, 240, 138, 0.9)');
        sunGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.25)');
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
      if (cosmetics.theme !== 'sunny' && cosmetics.theme !== 'everest' && cosmetics.theme !== 'rain') {
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
        // Soft white clouds for a sunny Swiss morning vs dark storm clouds for rain
        ctx.fillStyle = cosmetics.theme === 'rain' ? 'rgba(71, 85, 105, 0.25)' : 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 4; i++) {
          const cloudX = (i * 320 - verticalScrollRef.current * 0.2) % (canvas.width + 200);
          const finalCloudX = cloudX < -150 ? cloudX + canvas.width + 300 : cloudX;
          ctx.beginPath();
          ctx.arc(finalCloudX, 40 + i * 15, 25, 0, Math.PI * 2);
          ctx.arc(finalCloudX + 20, 35 + i * 15, 35, 0, Math.PI * 2);
          ctx.arc(finalCloudX - 20, 45 + i * 15, 20, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // flying alpine birds animation engine
      if (cosmetics.theme === 'everest' || cosmetics.theme === 'sunny') {
        birdsRef.current.forEach((bird) => {
          bird.x += bird.speedX;
          bird.y += bird.speedY + Math.sin(t * 0.04 + bird.wingAngle) * 0.1;
          bird.wingAngle += bird.wingDir;

          // Wrap around screen
          if (bird.x > canvas.width + 50) {
            bird.x = -50;
            bird.y = 40 + Math.random() * 90;
          }

          // Draw minimalist flying bird (V wings)
          ctx.save();
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          const flapY = Math.sin(bird.wingAngle) * bird.size * 0.7;
          ctx.moveTo(bird.x - bird.size, bird.y + flapY);
          ctx.lineTo(bird.x, bird.y);
          ctx.lineTo(bird.x + bird.size, bird.y + flapY);
          ctx.stroke();
          ctx.restore();
        });
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

      // MOUNTAIN GOAT ENGINE (Occasionally climbs & stands on Swiss peaks)
      if (cosmetics.theme === 'everest' || cosmetics.theme === 'sunny') {
        const goat = goatRef.current;
        if (!goat.active) {
          goat.timer++;
          // High spawn chance every 400 animation cycles
          if (goat.timer > 400 && Math.random() < 0.012) {
            goat.active = true;
            goat.direction = Math.random() > 0.5 ? 1 : -1;
            goat.x = goat.direction === 1 ? -60 : canvas.width + 60;
            goat.timer = 0;
          }
        } else {
          // Slow scenic alpine trot
          goat.x += goat.direction * 0.85;
          const goatY = getSlopeY(goat.x);

          // Draw Cute Mountain Goat Vector Shape
          ctx.save();
          ctx.translate(goat.x, goatY - 14); // Offset slightly above the ground slope
          ctx.scale(goat.direction, 1);

          // Cute curved black horns
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(3, -6, 5, Math.PI, Math.PI * 1.5);
          ctx.stroke();

          // Animated little legs
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.2;
          const legBob = Math.sin(t * 0.12) * 3.5;
          ctx.beginPath();
          // Front legs
          ctx.moveTo(3, 3); ctx.lineTo(3 + legBob, 10);
          ctx.moveTo(5, 3); ctx.lineTo(5 - legBob, 10);
          // Back legs
          ctx.moveTo(-5, 3); ctx.lineTo(-5 - legBob, 10);
          ctx.moveTo(-3, 3); ctx.lineTo(-3 + legBob, 10);
          ctx.stroke();

          // Fluffy white body
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Head & Neck
          ctx.beginPath();
          ctx.arc(5, -4, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Little black eye
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(6, -5, 0.7, 0, Math.PI * 2);
          ctx.fill();

          // Mountain Goat Goatee beard
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(3, -1);
          ctx.lineTo(2, 4);
          ctx.lineTo(5, 2);
          ctx.closePath();
          ctx.fill();

          ctx.restore();

          // Remove offscreen
          if ((goat.direction === 1 && goat.x > canvas.width + 80) || 
              (goat.direction === -1 && goat.x < -80)) {
            goat.active = false;
          }
        }
      }

      // Milestone flags
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
        const baseOffset = (milestone.mult - multiplier) * 260;
        const flagX = guyXRef.current + baseOffset;
        
        if (flagX > -100 && flagX < canvas.width + 100) {
          const flagY = getSlopeY(flagX);

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(flagX, flagY + 2, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Flagpole (Bigger: 60px height)
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(flagX, flagY);
          ctx.lineTo(flagX, flagY - 60);
          ctx.stroke();

          // Gold ball ornament at flagpole top
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(flagX, flagY - 60, 3, 0, Math.PI * 2);
          ctx.fill();

          // At each whole number, make the flag purple
          const isWholeNumber = milestone.mult % 1 === 0;
          const flagColor = isWholeNumber ? '#a855f7' : '#10b981'; // Purple for whole numbers, Emerald Green for others

          // Flag size details (Bigger flag: 48px width, 26px height)
          const flagTop = flagY - 55;
          const flagHeight = 26;
          const flagWidth = 48;
          
          // Realistic waving coordinate paths
          ctx.fillStyle = flagColor;
          ctx.beginPath();
          ctx.moveTo(flagX, flagTop);
          
          const wave1 = Math.sin(t * 0.12 + flagX * 0.05) * 3;
          const wave2 = Math.sin(t * 0.12 + (flagX - flagWidth) * 0.05) * 3;
          
          ctx.quadraticCurveTo(flagX - flagWidth / 2, flagTop + wave1, flagX - flagWidth, flagTop + wave2);
          ctx.lineTo(flagX - flagWidth, flagTop + flagHeight + wave2);
          ctx.quadraticCurveTo(flagX - flagWidth / 2, flagTop + flagHeight + wave1, flagX, flagTop + flagHeight);
          ctx.closePath();
          ctx.fill();

          // Highlight flag border outline
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Render the whole number or half number directly on the flag
          ctx.save();
          ctx.font = 'black 11px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Soft drop shadow directly on text
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 1.5;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          const displayLabel = isWholeNumber ? `${Math.floor(milestone.mult)}x` : `${milestone.mult}x`;
          ctx.fillText(displayLabel, flagX - flagWidth / 2, flagTop + flagHeight / 2 + wave1);
          ctx.restore();
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