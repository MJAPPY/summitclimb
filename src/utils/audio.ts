class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private heartbeatInterval: any = null;
  private yodelInterval: any = null;
  private isMuted: boolean = false;
  private currentYodelStep: number = 0;

  // Cinematic Alpine Delay / Reverb lines
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWet: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.setupAlpineDelay();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Setup simulated spatial acoustic reflection off mountain peak cliffs
  private setupAlpineDelay() {
    if (!this.ctx) return;
    try {
      this.delayNode = this.ctx.createDelay(1.5);
      this.delayFeedback = this.ctx.createGain();
      this.delayWet = this.ctx.createGain();

      // Realistic echoing times: 380ms delay reflecting a distant mountain wall
      this.delayNode.delayTime.setValueAtTime(0.38, this.ctx.currentTime);
      this.delayFeedback.gain.setValueAtTime(0.45, this.ctx.currentTime); // feedback echo
      this.delayWet.gain.setValueAtTime(0.3, this.ctx.currentTime); // wet gain level

      // Delay feedback loop routing
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);

      // Route dry to wet master output
      this.delayNode.connect(this.delayWet);
      this.delayWet.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Could not set up mountain acoustic echo lines:", e);
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopWind();
      this.stopHeartbeat();
      this.stopYodelMusic();
    } else {
      if (this.windGain) {
        this.initCtx();
        this.startWind();
      }
    }
  }

  startWind() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.stopWind();

      // High-quality brownian approximation noise for howling alpine wind gusting
      const bufferSize = 3 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // True mountain howling wind filter calculation
        output[i] = (lastOut * 0.98 + white * 0.02);
        lastOut = output[i];
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass'; // Bandpass for focused peak wind whistling
      this.windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.windFilter.Q.value = 4;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      noiseSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);

      noiseSource.start();
      (this as any).windSource = noiseSource;
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  updateWindIntensity(multiplier: number) {
    if (this.isMuted || !this.ctx || !this.windFilter || !this.windGain) return;
    const factor = Math.min(multiplier, 15) / 15;
    const targetFreq = 400 + factor * 950;
    const targetGain = 0.04 + factor * 0.28;

    this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.4);
    this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
  }

  stopWind() {
    if ((this as any).windSource) {
      try {
        (this as any).windSource.stop();
      } catch (e) {}
      (this as any).windSource = null;
    }
  }

  playHeartbeat(multiplier: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Heartbeat pace accelerates dynamically based on current altitude/multiplier
    const speedSec = Math.max(0.16, 0.75 - (multiplier - 1) * 0.075);

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    const triggerBeat = () => {
      if (this.isMuted || !this.ctx) return;
      try {
        // Deep resonance dual chambers compression sounds (Thump-thump)
        const playThump = (delay: number) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(48, this.ctx.currentTime + delay);
          osc.frequency.exponentialRampToValueAtTime(1, this.ctx.currentTime + delay + 0.14);

          gain.gain.setValueAtTime(0.4, this.ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.14);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + delay);
          osc.stop(this.ctx.currentTime + delay + 0.16);
        };

        playThump(0);
        playThump(0.11);
      } catch (e) {}
    };

    triggerBeat();
    this.heartbeatInterval = setInterval(triggerBeat, speedSec * 1000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Synthesize rich, warm, authentic accordion squeezing and dynamic vocal yodeling music!
  startYodelMusic() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopYodelMusic();
    this.currentYodelStep = 0;

    // Rich traditional Alpine progression chords
    // C4, E4, G4, C5 (vocal crack), G4, E4, G4, D4, F4, G4, B4, G4, F4, G4
    const yodelSequence = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 392.00,
      293.66, 349.23, 392.00, 493.88, 392.00, 349.23, 392.00
    ];

    const bassSequence = [
      130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81,
      146.83, 146.83, 146.83, 146.83, 146.83, 146.83, 146.83
    ];

    const playStep = () => {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const melodyFreq = yodelSequence[this.currentYodelStep % yodelSequence.length];
        const bassFreq = bassSequence[this.currentYodelStep % bassSequence.length];

        // 1. IMPROVED LEAD VOICE: Multiple oscillators + pitch vibrato for realistic vocal chords
        const leadOsc1 = this.ctx.createOscillator();
        const leadOsc2 = this.ctx.createOscillator(); // Detuned voice double
        const leadGain = this.ctx.createGain();

        leadOsc1.type = 'triangle';
        leadOsc2.type = 'sawtooth'; // Sawtooth detuned adds rich acoustic harmonics

        // Natural warm singing voice vibrato (6Hz modulation LFO)
        const vibratoLFO = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibratoLFO.frequency.setValueAtTime(5.8, now); // Human vocal frequency wobble
        vibratoGain.gain.setValueAtTime(melodyFreq * 0.008, now); // Subtle 0.8% pitch bend

        vibratoLFO.connect(vibratoGain);
        vibratoGain.connect(leadOsc1.frequency);
        vibratoGain.connect(leadOsc2.frequency);

        // Vocal glide yodel "cracks"
        if (melodyFreq >= 450) {
          // Quick slide upwards simulates authentic vocal registers cracking
          leadOsc1.frequency.setValueAtTime(melodyFreq - 95, now);
          leadOsc1.frequency.exponentialRampToValueAtTime(melodyFreq, now + 0.09);
          
          leadOsc2.frequency.setValueAtTime(melodyFreq - 95, now);
          leadOsc2.frequency.exponentialRampToValueAtTime(melodyFreq, now + 0.09);
        } else {
          leadOsc1.frequency.setValueAtTime(melodyFreq, now);
          leadOsc2.frequency.setValueAtTime(melodyFreq + 2.5, now); // Detuned spread
        }

        // Squeeze bellows envelope: Warm attack and organic decay release
        leadGain.gain.setValueAtTime(0, now);
        leadGain.gain.linearRampToValueAtTime(0.12, now + 0.04); // Attack curve
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24); // Decay curve

        // Reedy vocal track bandpass filtering
        const vocalFilter = this.ctx.createBiquadFilter();
        vocalFilter.type = 'bandpass';
        vocalFilter.frequency.setValueAtTime(780, now);
        vocalFilter.Q.setValueAtTime(1.8, now);

        leadOsc1.connect(vocalFilter);
        leadOsc2.connect(vocalFilter);
        
        // Low mix for high harmonics sawtooth double
        const synthMix = this.ctx.createGain();
        synthMix.gain.setValueAtTime(0.02, now); // Keeps sawtooth background subtle
        leadOsc2.connect(synthMix);

        vocalFilter.connect(leadGain);
        
        // Route to dry and master alpine reflections
        leadGain.connect(this.ctx.destination);
        if (this.delayNode) {
          leadGain.connect(this.delayNode);
        }

        // Start generators
        vibratoLFO.start(now);
        leadOsc1.start(now);
        leadOsc2.start(now);

        vibratoLFO.stop(now + 0.26);
        leadOsc1.stop(now + 0.26);
        leadOsc2.stop(now + 0.26);

        // 2. BOUNCY ACCORDION OOM-PAH BASS (Warm tuba tone)
        const bassOsc = this.ctx.createOscillator();
        const bassHarmonic = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassHarmonic.type = 'triangle';

        bassOsc.frequency.setValueAtTime(bassFreq, now);
        bassHarmonic.frequency.setValueAtTime(bassFreq * 1.5, now); // Perfect fifth fifth harmonic helper

        const isOffBeat = this.currentYodelStep % 2 === 1;
        const volumeFactor = isOffBeat ? 0.07 : 0.16;

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(volumeFactor, now + 0.03);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        const bassFilter = this.ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(220, now);

        bassOsc.connect(bassFilter);
        bassHarmonic.connect(bassFilter);
        bassFilter.connect(bassGain);
        
        bassGain.connect(this.ctx.destination);
        if (this.delayNode) {
          bassGain.connect(this.delayNode);
        }

        bassOsc.start(now);
        bassHarmonic.start(now);
        bassOsc.stop(now + 0.22);
        bassHarmonic.stop(now + 0.22);

        this.currentYodelStep++;
      } catch (e) {
        console.warn("Synth step generation warning:", e);
      }
    };

    // Trigger yodel tempo beat steps
    playStep();
    this.yodelInterval = setInterval(playStep, 230);
  }

  stopYodelMusic() {
    if (this.yodelInterval) {
      clearInterval(this.yodelInterval);
      this.yodelInterval = null;
    }
  }

  playBankSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Synthesize a gorgeous shimmering arpeggio chord through mountain echoes
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Shimmering C-Major Triumph Chord
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const subOsc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        subOsc.type = 'triangle';

        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        subOsc.frequency.setValueAtTime(freq + 1.5, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.5);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(this.ctx!.destination);
        if (this.delayNode) {
          gain.connect(this.delayNode);
        }

        osc.start(now + idx * 0.05);
        subOsc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.6);
        subOsc.stop(now + idx * 0.05 + 0.6);
      });
    } catch (e) {}
  }

  playCollapseSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise blast combined with massive sub drop echo
      const bufferSize = this.ctx.sampleRate * 1.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(10, now + 1.0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      if (this.delayNode) {
        gain.connect(this.delayNode);
      }

      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(130, now);
      sub.frequency.exponentialRampToValueAtTime(15, now + 0.85);

      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 1.2);
      sub.start(now);
      sub.stop(now + 1.0);
    } catch (e) {}
  }
}

export const audioSynth = new AudioSynthManager();