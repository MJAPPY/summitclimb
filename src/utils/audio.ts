class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private heartbeatInterval: any = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopWind();
      this.stopHeartbeat();
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

      // Wind noise buffer
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-ish noise filter approximation
        output[i] = (lastOut * 0.95 + white * 0.05);
        lastOut = output[i];
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'lowpass';
      this.windFilter.frequency.value = 350;
      this.windFilter.Q.value = 3;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

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
    const factor = Math.min(multiplier, 15) / 15; // capped simulation scale
    const targetFreq = 300 + factor * 800;
    const targetGain = 0.05 + factor * 0.25;

    this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
    this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
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

    // Heartbeat pulse frequency speeds up as multiplier rises
    const speedSec = Math.max(0.18, 0.8 - (multiplier - 1) * 0.08);

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    const triggerBeat = () => {
      if (this.isMuted || !this.ctx) return;
      try {
        // Double beat synth: Thump-thump
        const playThump = (delay: number) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(55, this.ctx.currentTime + delay);
          osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + delay + 0.12);

          gain.gain.setValueAtTime(0.3, this.ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + 0.12);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + delay);
          osc.stop(this.ctx.currentTime + delay + 0.15);
        };

        playThump(0);
        playThump(0.12);
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

  playBankSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Synthesize a majestic ascending chord arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major triumph
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.15, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.5);
      });
    } catch (e) {}
  }

  playCollapseSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise blast combined with low sub drop
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(30, now + 0.7);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(100, now);
      sub.frequency.exponentialRampToValueAtTime(20, now + 0.6);

      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.85);
      sub.start(now);
      sub.stop(now + 0.7);
    } catch (e) {}
  }
}

export const audioSynth = new AudioSynthManager();