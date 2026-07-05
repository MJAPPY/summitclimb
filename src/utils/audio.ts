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

      // High-end echoing: reflecting sound with warm high-frequency dampening
      this.delayNode.delayTime.setValueAtTime(0.42, this.ctx.currentTime);
      this.delayFeedback.gain.setValueAtTime(0.5, this.ctx.currentTime); 
      this.delayWet.gain.setValueAtTime(0.35, this.ctx.currentTime); 

      // Connect feedback loop
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);

      // Route to master
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
      this.initCtx();
      if (this.windGain) {
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
        // Soft, ambient pulse with almost zero high-frequency or sudden click energy
        const playThump = (delay: number) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(35, this.ctx.currentTime + delay);
          osc.frequency.exponentialRampToValueAtTime(1, this.ctx.currentTime + delay + 0.14);

          // Substantially lowered volume to remove sharp thuds
          gain.gain.setValueAtTime(0.02, this.ctx.currentTime + delay);
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

    // Authentic, cheerful Alpine folk progression chords & melodies
    // Traditional Austrian/Swiss cadence phrases: C major and G dominant
    const yodelSequence = [
      329.63, 392.00, 523.25, 659.25, 523.25, 392.00, // C-E-G-C-E-C-G vocal chest yodel
      392.00, 493.88, 587.33, 783.99, 587.33, 493.88, // G dominant chord register shifts
      349.23, 392.00, 440.00, 523.25, 587.33, 659.25,
      523.25, 392.00, 329.63, 261.63, 329.63, 392.00
    ];

    const bassSequence = [
      130.81, 130.81, 196.00, 196.00, 130.81, 130.81,
      146.83, 146.83, 196.00, 196.00, 146.83, 146.83,
      130.81, 196.00, 146.83, 196.00, 130.81, 130.81,
      130.81, 130.81, 130.81, 130.81, 130.81, 130.81
    ];

    const playStep = () => {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const index = this.currentYodelStep % yodelSequence.length;
        const melodyFreq = yodelSequence[index];
        const bassFreq = bassSequence[index];

        // 1. PHYSICAL ACCORDION MUSETTE LEAD GENERATOR
        // Accordion musette requires triple-reed detuning. One master reed, 
        // one sharp (+4 cents), and one flat (-4 cents). This produces the iconic sweet tremolo sound.
        const leadCenter = this.ctx.createOscillator();
        const leadSharp = this.ctx.createOscillator();
        const leadFlat = this.ctx.createOscillator();
        const leadSubOctave = this.ctx.createOscillator(); // Authentic deep octave reed
        
        const leadGain = this.ctx.createGain();

        // Waveform: Rich triangle for organic woodiness, combined with sawtooth detunes
        leadCenter.type = 'triangle';
        leadSharp.type = 'sawtooth';
        leadFlat.type = 'sawtooth';
        leadSubOctave.type = 'triangle';

        // Detuning values (in cents)
        leadSharp.detune.setValueAtTime(14, now);
        leadFlat.detune.setValueAtTime(-14, now);
        leadSubOctave.frequency.setValueAtTime(melodyFreq * 0.5, now); // 1 Octave below

        // Glide-up yodel pitch crack simulation
        const pitchGlissandoTime = 0.08;
        if (melodyFreq >= 500) {
          // Instant high-to-low chest/head register cracking
          leadCenter.frequency.setValueAtTime(melodyFreq - 150, now);
          leadCenter.frequency.exponentialRampToValueAtTime(melodyFreq, now + pitchGlissandoTime);
          leadSharp.frequency.setValueAtTime(melodyFreq - 150, now);
          leadSharp.frequency.exponentialRampToValueAtTime(melodyFreq, now + pitchGlissandoTime);
          leadFlat.frequency.setValueAtTime(melodyFreq - 150, now);
          leadFlat.frequency.exponentialRampToValueAtTime(melodyFreq, now + pitchGlissandoTime);
        } else {
          leadCenter.frequency.setValueAtTime(melodyFreq, now);
          leadSharp.frequency.setValueAtTime(melodyFreq, now);
          leadFlat.frequency.setValueAtTime(melodyFreq, now);
        }

        // Bellows Pressure Envelope: Realistic accordion sound swells at the note peak
        leadGain.gain.setValueAtTime(0, now);
        leadGain.gain.linearRampToValueAtTime(0.08, now + 0.03); // Bellows attack
        leadGain.gain.linearRampToValueAtTime(0.07, now + 0.12); // Sustain
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24); // Release decay

        // Musette Reed Filter to round off sharp edges
        const musetteFilter = this.ctx.createBiquadFilter();
        musetteFilter.type = 'bandpass';
        musetteFilter.frequency.setValueAtTime(880, now);
        musetteFilter.Q.setValueAtTime(1.5, now);

        // Connect generator array
        leadCenter.connect(musetteFilter);
        leadSharp.connect(musetteFilter);
        leadFlat.connect(musetteFilter);
        leadSubOctave.connect(musetteFilter);

        musetteFilter.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        if (this.delayNode) {
          leadGain.connect(this.delayNode);
        }

        // Start instruments
        leadCenter.start(now);
        leadSharp.start(now);
        leadFlat.start(now);
        leadSubOctave.start(now);

        leadCenter.stop(now + 0.25);
        leadSharp.stop(now + 0.25);
        leadFlat.stop(now + 0.25);
        leadSubOctave.stop(now + 0.25);

        // 3. SMOOTH DOWNBEAT BASS (Downbeat only to prevent steady bass thumping noise)
        if (this.currentYodelStep % 4 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();

          // Warm pure sine tone replaces complex sawtooth woodwinds to eliminate thud peaks
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          // Slow swell-attack and soft decline completely blocks popping and heavy pulsing sounds
          bassGain.gain.setValueAtTime(0, now);
          bassGain.gain.linearRampToValueAtTime(0.03, now + 0.06); 
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          const bassFilter = this.ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(120, now);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          if (this.delayNode) {
            bassGain.connect(this.delayNode);
          }

          bassOsc.start(now);
          bassOsc.stop(now + 0.4);
        }

        this.currentYodelStep++;
      } catch (e) {
        console.warn("Synth step generation warning:", e);
      }
    };

    // Humanized rhythmic scheduling: slightly swinging the polka feel
    const stepTimeMs = 230;
    const playAndSchedule = () => {
      if (this.isMuted || !this.yodelInterval) return;
      playStep();
    };

    playStep();
    this.yodelInterval = setInterval(playAndSchedule, stepTimeMs);
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