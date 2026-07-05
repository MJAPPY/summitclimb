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
  
  // Persistent starfield list to prevent flickering and guarantee a gorgeous galaxy backdrop
  const starfieldRef = useRef<Array<{ x: number; y: number; size: number; twinkleSpeed: number; phase: number }>>([]);

  // Atmospheric weather particles
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

  // Trail behind the climber
  const climberTrailRef = useRef<Array<{
    x: number;
    y: number;
    alpha: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
  }>>([]);

  // Static stars initialization on mount
  useEffect(() => {
    starfieldRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * 1280,
      y: Math.random() * 450,
      size: 1 + Math.random() * 2.5,
      twinkleSpeed: 0.02 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2
    }));
  }, []);

  // Compute procedurally generated lush green hills
  const getSlopeY = (x: number, scroll: number) => {
    // Elegant steady incline going upwards
    const baseSlope = 200 + x * 0.35;
    // Low frequency waves representing natural grass mounds
    const terrainNoise = Math.sin((x + scroll * 0.4) * 0.005) * 35 +
                        Math.cos((x + scroll * 0.15) * 0.015) * 12;
    return 800 - (baseSlope + terrainNoise);
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 1280;
    canvas.height = 800;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let time = 0;
    let scroll = 0;

    const render = () => {
      time += 1;
      
      // Auto scroll active during climbing gameplay
      const climbSpeed = gameState === 'climbing' ? Math.max(3.2, multiplier * 4.2) : 0.4;
      scroll += climbSpeed;

      // 1. SKY BACKDROP (Deep violet-indigo starry night sky)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#020112'); // Pitch black-blue
      skyGrad.addColorStop(0.35, '#07052e'); // Midnight blue
      skyGrad.addColorStop(0.7, '#12073d'); // Royal indigo
      skyGrad.addColorStop(1, '#1b0e52'); // Atmospheric twilight violet
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. TWINKLING NEON STARS
      starfieldRef.current.forEach((star) => {
        const tw = Math.sin(time * star.twinkleSpeed + star.phase);
        const glowOpacity = 0.35 + (tw + 1) * 0.3;
        
        ctx.save();
        ctx.shadowBlur = star.size * 3;
        ctx.shadowColor = '#06b6d4'; // Glowing blue stars
        ctx.fillStyle = `rgba(255, 255, 255, ${glowOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. MAGNIFICENT SNOW-CAPPED BACKGROUND MOUNTAIN PEAK
      ctx.save();
      const mountainX = 1000 - (scroll * 0.08) % 1500;
      ctx.translate(mountainX, 150);
      
      // Draw mountain shadow silhouette
      ctx.fillStyle = '#0a0521';
      ctx.beginPath();
      ctx.moveTo(0, 500);
      ctx.lineTo(250, 0);
      ctx.lineTo(500, 500);
      ctx.closePath();
      ctx.fill();

      // Deep purple mountain base
      const mountGrad = ctx.createLinearGradient(250, 0, 250, 500);
      mountGrad.addColorStop(0, '#311066');
      mountGrad.addColorStop(0.5, '#17063d');
      mountGrad.addColorStop(1, '#0e0326');
      ctx.fillStyle = mountGrad;
      ctx.beginPath();
      ctx.moveTo(30, 500);
      ctx.lineTo(250, 0);
      ctx.lineTo(470, 500);
      ctx.closePath();
      ctx.fill();

      // Sharp white snowcap cap matching the reference image peak
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(250, 0);
      ctx.lineTo(200, 110);
      ctx.lineTo(225, 130);
      ctx.lineTo(240, 115);
      ctx.lineTo(255, 135);
      ctx.lineTo(270, 120);
      ctx.lineTo(300, 110);
      ctx.closePath();
      ctx.fill();

      // Highlight peak snow shades
      ctx.fillStyle = '#bae6fd'; // Ice cyan
      ctx.beginPath();
      ctx.moveTo(250, 0);
      ctx.lineTo(250, 120);
      ctx.lineTo(270, 120);
      ctx.lineTo(300, 110);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 4. LUSH GREEN SLOPES (Grassy Hillside)
      // We draw layered hills to give an authentic 3D depth parallax
      const drawHillLayer = (scrollMult: number, heightOffset: number, fillColors: string[], strokeColor: string) => {
        const hillOffset = scroll * scrollMult;
        ctx.fillStyle = fillColors[0];
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = -20; x <= canvas.width + 20; x += 15) {
          ctx.lineTo(x, getSlopeY(x, hillOffset) + heightOffset);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        
        const hillGrad = ctx.createLinearGradient(0, 300, 0, canvas.height);
        hillGrad.addColorStop(0, fillColors[0]);
        hillGrad.addColorStop(0.5, fillColors[1]);
        hillGrad.addColorStop(1, fillColors[2]);
        ctx.fillStyle = hillGrad;
        ctx.fill();

        // Highlight stroke along the ridge line
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let x = -20; x <= canvas.width + 20; x += 15) {
          const y = getSlopeY(x, hillOffset) + heightOffset;
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      // Background green hill layer
      drawHillLayer(0.25, 60, ['#0f5132', '#08321e', '#031b10'], '#198754');
      
      // Foreground active climb hill layer
      drawHillLayer(1.0, 0, ['#15803d', '#14532d', '#052e16'], '#22c55e');

      // 5. PROCEDURAL RETRO PINE TREES ALONG THE HILLSIDE
      // Generate individual evergreen pixel-style pines pinned to the ground based on viewport scroll
      ctx.save();
      const treeSpacing = 90;
      const startTreeIdx = Math.floor(scroll / treeSpacing) - 1;
      const endTreeIdx = startTreeIdx + Math.ceil(canvas.width / treeSpacing) + 2;

      for (let i = startTreeIdx; i <= endTreeIdx; i++) {
        // Deterministic pseudo-randomness based on tree index
        const randSize = 25 + Math.abs(Math.sin(i * 453.12)) * 30;
        const offsetLeft = Math.cos(i * 129.85) * 40;
        const treeX = (i * treeSpacing) - scroll + offsetLeft;
        const treeY = getSlopeY(treeX, scroll);

        if (treeX > -60 && treeX < canvas.width + 60) {
          ctx.save();
          ctx.translate(treeX, treeY);

          // Tree trunk
          ctx.fillStyle = '#451a03'; // Brown bark
          ctx.fillRect(-3, -randSize * 0.15, 6, randSize * 0.2);

          // Foliage layers (classic retro triangle overlapping blocks)
          ctx.fillStyle = i % 2 === 0 ? '#166534' : '#15803d'; // High contrast forest green
          
          // Bottom layer
          ctx.beginPath();
          ctx.moveTo(0, -randSize * 0.9);
          ctx.lineTo(-randSize * 0.45, -randSize * 0.15);
          ctx.lineTo(randSize * 0.45, -randSize * 0.15);
          ctx.closePath();
          ctx.fill();

          // Mid layer
          ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#22c55e';
          ctx.beginPath();
          ctx.moveTo(0, -randSize * 0.9);
          ctx.lineTo(-randSize * 0.35, -randSize * 0.4);
          ctx.lineTo(randSize * 0.35, -randSize * 0.4);
          ctx.closePath();
          ctx.fill();

          // Top peak layer
          ctx.fillStyle = '#4ade80'; // Bright light green cap
          ctx.beginPath();
          ctx.moveTo(0, -randSize);
          ctx.lineTo(-randSize * 0.22, -randSize * 0.65);
          ctx.lineTo(randSize * 0.22, -randSize * 0.65);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }
      ctx.restore();

      // 6. MILESTONE FLAGPOLES WITH GLOWING GLOBES AND NEON FLAGS
      const milestones = [1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0, 15.0, 20.0, 30.0, 50.0];
      milestones.forEach((mark) => {
        // Delta offset distance based on active multiplier progress scale
        const delta = (mark - multiplier) * 360;
        const flagX = 350 + delta;

        if (flagX > -150 && flagX < canvas.width + 150) {
          const flagY = getSlopeY(flagX, scroll);

          // Pole Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(flagX, flagY, 15, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          const poleHeight = 135;
          const segmentCount = 8;
          const segmentHeight = poleHeight / segmentCount;

          // Render Red & White striped flagpole matching the reference image spec
          for (let s = 0; s < segmentCount; s++) {
            ctx.fillStyle = s % 2 === 0 ? '#ef4444' : '#ffffff';
            ctx.fillRect(flagX - 3, flagY - (s + 1) * segmentHeight, 6, segmentHeight);
            ctx.strokeStyle = '#02021e';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(flagX - 3, flagY - (s + 1) * segmentHeight, 6, segmentHeight);
          }

          // Glowing gold orb lamp on top of the flagpole
          const topOrbY = flagY - poleHeight - 5;
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(flagX, topOrbY, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Neon colored rectangle flag (flat pink/magenta or bright cyan)
          const isPink = mark % 1 === 0;
          const flagColor = isPink ? '#ec4899' : '#06b6d4';
          const flagWidth = 78;
          const flagHeight = 32;
          const flagTop = flagY - poleHeight + 8;

          ctx.save();
          // Glow effect on the neon flags
          ctx.shadowBlur = 8;
          ctx.shadowColor = flagColor;
          
          // Draw flag border outline
          ctx.fillStyle = '#090d16';
          ctx.fillRect(flagX - flagWidth - 2, flagTop - 2, flagWidth + 4, flagHeight + 4);

          // Draw flag inner fill
          ctx.fillStyle = flagColor;
          ctx.fillRect(flagX - flagWidth, flagTop, flagWidth, flagHeight);
          ctx.restore();

          // White text labeling the altitude (e.g., "1.5x", "2x")
          ctx.save();
          ctx.font = 'bold 11px "Press Start 2P", monospace, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${mark % 1 === 0 ? Math.floor(mark) : mark.toFixed(1)}x`, flagX - flagWidth / 2, flagTop + flagHeight / 2);
          ctx.restore();
        }
      });

      // 7. HERO RETRO CLIMBER (Custom high-fidelity pixel style recreation)
      // Draw the iconic red parka explorer carrying an orange backpack and wielding a pickaxe
      ctx.save();
      const climberX = 350;
      const climberBaseY = getSlopeY(climberX, scroll);
      
      // Dynamic bobbing during active ascents
      const verticalBob = gameState === 'climbing' ? Math.abs(Math.sin(time * 0.25)) * 10 : 0;
      const climberY = climberBaseY - 60 - verticalBob;

      ctx.translate(climberX, climberY);

      // Shadow overlay
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 60 + verticalBob, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // DRAW BACKPACK (Vibrant Orange/Yellow block with pixel strap lines)
      ctx.fillStyle = '#f97316'; // Orange pack body
      ctx.fillRect(-22, 10, 12, 28);
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-22, 10, 12, 28);
      
      // Backpack upper flap (Yellow accent)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-22, 5, 12, 6);
      ctx.strokeRect(-22, 5, 12, 6);

      // DRAW PLAYER BODY (Red Parka Jacket)
      ctx.fillStyle = '#ef4444'; // Red jacket
      ctx.fillRect(-10, 10, 20, 30);
      ctx.strokeRect(-10, 10, 20, 30);

      // White chest jacket stripe details
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, 22, 20, 3.5);

      // DRAW LEG & FOOT PHYSICS (Blue pants, white pixel shoes)
      const walkCycle = Math.sin(time * 0.22);
      const leftLegShift = gameState === 'climbing' ? walkCycle * 8 : 0;
      const rightLegShift = gameState === 'climbing' ? -walkCycle * 8 : 0;

      // Left leg
      ctx.fillStyle = '#1d4ed8'; // Indigo pants
      ctx.fillRect(-8, 40, 6, 10 + leftLegShift);
      ctx.fillStyle = '#ffffff'; // White sneaker bottom
      ctx.fillRect(-10, 50 + leftLegShift, 9, 5);
      ctx.fillStyle = '#000000';
      ctx.strokeRect(-10, 50 + leftLegShift, 9, 5);

      // Right leg
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(2, 40, 6, 10 + rightLegShift);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 50 + rightLegShift, 9, 5);
      ctx.fillStyle = '#000000';
      ctx.strokeRect(0, 50 + rightLegShift, 9, 5);

      // DRAW ARM HOLDING PICKAXE
      ctx.save();
      ctx.translate(10, 20);
      
      // Swing motion
      const pickSwing = gameState === 'climbing' ? Math.sin(time * 0.25) * 0.45 : -0.2;
      ctx.rotate(pickSwing);

      // Wood pickaxe handle
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(15, -15);
      ctx.stroke();

      // Steel double-sided pick head
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(10, -18);
      ctx.lineTo(25, -25);
      ctx.lineTo(16, -11);
      ctx.lineTo(3, -12);
      ctx.closePath();
      ctx.fill();

      // Sharp glowing tip highlight
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, -22);
      ctx.lineTo(27, -27);
      ctx.stroke();

      ctx.restore();

      // DRAW EXPLORER FACE & RETRO RED CAP
      ctx.fillStyle = '#ffedd5'; // Peach skin tone block
      ctx.fillRect(-6, -8, 14, 18);
      ctx.strokeRect(-6, -8, 14, 18);

      // Dark pixels for explorer eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -3, 3, 3);

      // Red Cap with brim matching the screenshot pixel artwork character
      ctx.fillStyle = '#dc2626'; // Deep Red cap
      ctx.fillRect(-8, -14, 18, 7);
      ctx.strokeRect(-8, -14, 18, 7);
      // Cap Brim pointing right
      ctx.fillRect(6, -10, 6, 3);

      ctx.restore();

      // 8. CRASH COLLAPSE PARTICLES
      if (gameState === 'collapsed') {
        const boomRadius = 130;
        const boomGrad = ctx.createRadialGradient(climberX, climberBaseY - 30, 5, climberX, climberBaseY - 30, boomRadius);
        boomGrad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
        boomGrad.addColorStop(0.2, 'rgba(244, 63, 94, 0.8)');
        boomGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.4)');
        boomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = boomGrad;
        ctx.beginPath();
        ctx.arc(climberX, climberBaseY - 30, boomRadius, 0, Math.PI * 2);
        ctx.fill();
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
        Summit Climb Arcade Engine Active
      </div>
    </div>
  );
};