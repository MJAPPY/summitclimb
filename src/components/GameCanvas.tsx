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
  
  // Track continuous parallax scrolls and particle dynamics
  const particlesRef = useRef<Array<{ x: number; y: number; speedY: number; speedX: number; size: number; color: string }>>([]);
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

    canvas.width = 800;
    canvas.height = 420;

    // Set up particles blowing from the top-right to bottom-left (wind hitting climber)
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 120; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speedY: 2 + Math.random() * 3,
          speedX: -2 - Math.random() * 4, // Moving leftwards
          size: 1 + Math.random() * 3,
          color: '#ffffff',
        });
      }
    }

    const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const themeColors = getThemeColors();

      // Continuous rising scroll animation physics
      const climbSpeed = gameState === 'climbing' ? Math.max(3, multiplier * 4) : 0.6;
      verticalScrollRef.current += climbSpeed;

      // Realistic Sky Twilight Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, themeColors.bgGradStart);
      skyGrad.addColorStop(0.5, themeColors.bgGradMid);
      skyGrad.addColorStop(1, themeColors.bgGradEnd);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Twinkling starry sky drifting down-left (climbing up-right)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < 45; i++) {
        const starX = (i * 83 - verticalScrollRef.current * 0.1) % canvas.width;
        const starY = (i * 41 + verticalScrollRef.current * 0.05) % (canvas.height - 120);
        // Twinkle factor
        const starSize = 0.5 + Math.abs(Math.sin((t + i * 8) * 0.04)) * 1.5;
        ctx.fillRect(starX >= 0 ? starX : starX + canvas.width, starY, starSize, starSize);
      }

      // Volumetric Glowing Moon
      const moonX = 160 - (verticalScrollRef.current * 0.05) % 300;
      const moonY = 90 + (verticalScrollRef.current * 0.02) % 150;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 1, moonX, moonY, 60);
      moonGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      moonGrad.addColorStop(0.2, 'rgba(238, 242, 255, 0.3)');
      moonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Far Mountains Silhouette (Matterhorn) scrolling down-left
      ctx.fillStyle = themeColors.mountainFar;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const farScrollX = (verticalScrollRef.current * 0.12) % canvas.width;
      const farScrollY = (verticalScrollRef.current * 0.08) % 350;
      for (let x = -40; x <= canvas.width + 40; x += 40) {
        const testX = x + farScrollX; // shifting left/right
        const baseHeight = 170 + Math.sin(testX * 0.006) * 35;
        // Peak spikes representing deep ridges
        const peak = (Math.abs(Math.floor(testX / 130)) % 3 === 0) ? 120 : 20;
        const finalHeight = baseHeight + peak - farScrollY;
        ctx.lineTo(x, canvas.height - Math.max(10, finalHeight));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Mid Mountains Silhouette scrolling down-left
      ctx.fillStyle = themeColors.mountainMid;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      const midScrollX = (verticalScrollRef.current * 0.28) % canvas.width;
      const midScrollY = (verticalScrollRef.current * 0.18) % 280;
      for (let x = -30; x <= canvas.width + 30; x += 30) {
        const testX = x + midScrollX;
        const baseHeight = 120 + Math.cos(testX * 0.012) * 22;
        const finalHeight = baseHeight - midScrollY;
        ctx.lineTo(x, canvas.height - Math.max(10, finalHeight));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Pine trees cluster scrolling away
      if (verticalScrollRef.current < 750) {
        const treesFade = Math.max(0, 1 - verticalScrollRef.current / 750);
        ctx.save();
        ctx.globalAlpha = treesFade;
        ctx.fillStyle = '#064e3b';
        const forestScrollX = verticalScrollRef.current * 0.35;
        const forestScrollY = verticalScrollRef.current * 0.15;
        for (let i = 0; i < 5; i++) {
          const treeX = 140 + i * 35 - forestScrollX;
          const treeY = canvas.height - 25 + forestScrollY;
          ctx.beginPath();
          ctx.moveTo(treeX, treeY - 25);
          ctx.lineTo(treeX - 8, treeY);
          ctx.lineTo(treeX + 8, treeY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // NEAR SNOW SLOPE (Ascending up to the right!)
      // The curve starts low on the left (X=0) and goes steeply up to the right (X=800)
      const getSlopeY = (x: number) => {
        // base height rises from left to right
        const baseHeight = 50 + x * 0.44;
        
        // Continuous waves shifting leftwards as we climb up-right
        const waveScroll = Math.sin((x + verticalScrollRef.current * 0.5) * 0.012) * 12;
        
        return canvas.height - (baseHeight + waveScroll);
      };

      // Draw Main Snowy Surface Geometry
      ctx.fillStyle = themeColors.mountainNear;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = -20; x <= canvas.width + 40; x += 10) {
        ctx.lineTo(x, getSlopeY(x));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw White snowy ridge lining for high realism
      ctx.strokeStyle = themeColors.snowColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 10) {
        if (x === -20) ctx.moveTo(x, getSlopeY(x));
        else ctx.lineTo(x, getSlopeY(x));
      }
      ctx.stroke();

      // Secondary ice crust shading
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      for (let x = -20; x <= canvas.width + 40; x += 15) {
        if (x === -20) ctx.moveTo(x, getSlopeY(x) + 8);
        else ctx.lineTo(x, getSlopeY(x) + 8);
      }
      ctx.stroke();

      // DEFINE MILESTONE FLAGS PASSING BY
      // Since climbing up-right, flags scroll leftwards (down the slope) as multiplier rises.
      const milestones = [
        { mult: 1.5, label: '1.5x Peak' },
        { mult: 2.0, label: '2.0x Crest' },
        { mult: 3.0, label: '3.0x Glacier' },
        { mult: 5.0, label: '5.0x Ascent' },
        { mult: 10.0, label: '10.0x Ridge' },
        { mult: 15.0, label: '15.0x Stratosphere' },
        { mult: 25.0, label: '25.0x Apex' },
      ];

      // Draw milestone flags
      milestones.forEach((milestone) => {
        // Calculate flag X relative to multiplier progress
        // A flag at 'mult' will pass GUY when the multiplier reaches 'mult'
        const baseOffset = (milestone.mult - multiplier) * 260;
        const flagX = guyXRef.current + baseOffset;
        
        // Only render flags that are on screen
        if (flagX > -50 && flagX < canvas.width + 50) {
          const flagY = getSlopeY(flagX);

          // Shadow under flag
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.ellipse(flagX, flagY + 2, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Silver flagpole
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(flagX, flagY);
          ctx.lineTo(flagX, flagY - 45);
          ctx.stroke();

          // Milestone Pennant flag
          ctx.fillStyle = cosmetics.flag === 'gold777' ? '#eab308' :
                          cosmetics.flag === 'pirate' ? '#111827' :
                          cosmetics.flag === 'cyber' ? '#ec4899' : '#10b981';

          ctx.beginPath();
          ctx.moveTo(flagX, flagY - 45);
          const bannerWave = Math.sin(t * 0.1 + milestone.mult) * 6;
          // Flags fly backward to the left as wind blows left
          ctx.lineTo(flagX - 32, flagY - 38 + bannerWave);
          ctx.lineTo(flagX, flagY - 30);
          ctx.closePath();
          ctx.fill();

          // Flag banner text labels
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(milestone.label, flagX - 30, flagY - 34 + bannerWave / 2);
        }
      });

      // CLIMBER "GUY" positioning & posture scaling up-right
      let targetX = 260;
      if (gameState === 'climbing') {
        // Climbs further up-right (higher X coordinate) as altitude multiplier scales
        targetX = Math.min(620, 260 + (multiplier - 1) * 20);
      } else if (gameState === 'collapsed') {
        targetX = 260; // fallen
      } else if (gameState === 'banked') {
        targetX = 540; // secured summit
      }

      // Smooth step coordinate lerp
      guyXRef.current += (targetX - guyXRef.current) * 0.1;
      const guyBaseY = getSlopeY(guyXRef.current);

      // Leaning forward & jumping bobs matching climb speeds
      const climbBob = gameState === 'climbing' ? Math.abs(Math.sin(t * 0.24)) * 14 : 0;
      guyYOffsetRef.current = guyBaseY - 26 - climbBob;

      // Draw custom climbing trails (drifting leftward/downward)
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

      // Update & render Trails
      climberTrailRef.current.forEach((pt, i) => {
        pt.alpha -= 0.05;
        // Trails drift left and down
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

      // DRAW SUPERHERO GUY (facing and leaning to the right)
      ctx.save();
      
      // Real shadow / glowing aura effects
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

      // 1. Cape fluttering behind him to the left (wind blows leftwards)
      ctx.fillStyle = capeColor;
      ctx.beginPath();
      ctx.moveTo(guyXRef.current - 8, guyYOffsetRef.current + 4);
      const capeWaveX = guyXRef.current - 26 - (gameState === 'climbing' ? Math.sin(t * 0.3) * 8 : Math.sin(t * 0.1) * 4);
      const capeWaveY = guyYOffsetRef.current + 12 + Math.cos(t * 0.2) * 6;
      ctx.lineTo(capeWaveX, capeWaveY);
      ctx.lineTo(guyXRef.current - 10, guyYOffsetRef.current + 22);
      ctx.closePath();
      ctx.fill();

      // Mirror horizontal translation to face Right
      if (guyImageRef.current) {
        ctx.save();
        // Translate and scale horizontally to mirror GUY to face the climb direction (right)
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
        // Head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 12, 8, 0, Math.PI * 2);
        ctx.fill();

        // Sunglasses facing right
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(guyXRef.current + 1, guyYOffsetRef.current - 15, 7, 3);

        // Strong climber torso
        ctx.fillStyle = climberColor;
        ctx.fillRect(guyXRef.current - 8, guyYOffsetRef.current - 4, 16, 20);

        // Blonde legendary hair
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current - 18, 9, Math.PI, 0);
        ctx.fill();

        // Arms reaching rightwards to scale slopes
        ctx.strokeStyle = climberColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(guyXRef.current + 8, guyYOffsetRef.current + 2);
        const rightArmFlex = gameState === 'climbing' ? Math.sin(t * 0.2) * 6 : 0;
        ctx.lineTo(guyXRef.current + 16, guyYOffsetRef.current - 2 + rightArmFlex);
        ctx.stroke();
      }

      ctx.restore();

      // WEATHER WIND PARTICLES (Blowing leftward, hitting climber head-on!)
      ctx.fillStyle = themeColors.snowColor;
      const weatherSetting = cosmetics.weather;

      particlesRef.current.forEach((p) => {
        let dragX = p.speedX;
        let dragY = p.speedY;

        // Extra forces added when climbing up-right to emphasize progress speed
        if (gameState === 'climbing') {
          dragY += climbSpeed * 1.5; // continuous downward fall
          dragX -= climbSpeed * 1.2; // heavy leftward push
        }

        if (weatherSetting === 'blizzard') {
          dragX = -10 - Math.random() * 5;
          dragY = 3 + Math.random() * 3;
        } else if (weatherSetting === 'storm') {
          dragX = -6 - Math.random() * 3;
          dragY = 9 + Math.random() * 5;
        } else if (weatherSetting === 'neonrain') {
          dragX = -2;
          dragY = 16 + Math.random() * 4;
        }

        p.x += dragX;
        p.y += dragY;

        // Wrap particles
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) {
          p.x = canvas.width;
          p.y = Math.random() * canvas.height;
        }

        let particleColor = themeColors.snowColor;
        if (weatherSetting === 'neonrain') {
          particleColor = `hsl(${(t * 2 + p.x) % 360}, 100%, 65%)`;
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

      // Avalanche collapse
      if (gameState === 'collapsed') {
        const boomGradient = ctx.createRadialGradient(
          guyXRef.current, guyYOffsetRef.current, 5,
          guyXRef.current, guyYOffsetRef.current, 80
        );
        boomGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
        boomGradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
        boomGradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = boomGradient;
        ctx.beginPath();
        ctx.arc(guyXRef.current, guyYOffsetRef.current, 85, 0, Math.PI * 2);
        ctx.fill();

        // Fallen avalanche blocks swept leftwards
        ctx.fillStyle = '#cbd5e1';
        for (let i = 0; i < 7; i++) {
          const debrisX = guyXRef.current - (t % 20) * 3 + Math.sin(i) * 30;
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
        className="w-full aspect-[2/1] max-h-[440px] object-cover block"
      />
      <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full text-slate-300 pointer-events-none capitalize">
        Swiss Peak ({cosmetics.weather})
      </div>
    </div>
  );
};