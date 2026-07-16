/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialization on first user interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.init();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft high-frequency pluck for dropping - BOOSTED & DUAL HARMONIC
  public playDrop() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const comp = this.ctx.createDynamicsCompressor();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(650, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.22);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1300, now);
      osc2.frequency.exponentialRampToValueAtTime(360, now + 0.22);

      gain.gain.setValueAtTime(0.48, now); // Significantly louder
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(comp);
      comp.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.24);
      osc2.stop(now + 0.24);
    } catch (e) {
      console.warn("Audio drop failed", e);
    }
  }

  // Soft low-passed thud for collisions - BOOSTED and full frequency punch
  public playBounce(velocity: number) {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      // Scale volume with collision velocity but keep it loud
      const volume = Math.min(0.48, Math.max(0.12, velocity * 0.08));
      if (volume < 0.05) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {
      console.warn("Audio bounce failed", e);
    }
  }

  // Divine bells with progressive pitch scaling + punchy arcade blast - SUPER BOOSTED with master compressor
  public playMerge(tierIndex: number) {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Pentatonic scale based on tier for harmonic synergy
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const baseFreq = scale[tierIndex % scale.length];

      // Compressor to avoid clipping under high gains
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-10, now);
      comp.knee.setValueAtTime(15, now);
      comp.ratio.setValueAtTime(12, now);
      comp.attack.setValueAtTime(0.003, now);
      comp.release.setValueAtTime(0.15, now);
      comp.connect(this.ctx.destination);

      // 1. Harmonics chime - HEAVILY BOOSTED for loud/clear feedback
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.3);

      gain1.gain.setValueAtTime(0.85, now); // Super loud
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(baseFreq * 2.01, now);

      gain2.gain.setValueAtTime(0.55, now); // Super loud
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(comp);

      osc2.connect(gain2);
      gain2.connect(comp);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);

      // 2. Deep Sub Bass Thump (grows louder and lower with higher tiers) - BOOSTED
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFreq = Math.max(50, 140 - tierIndex * 8); // punchy bass for larger orbs

      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(subFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

      const maxSubGain = Math.min(0.95, 0.45 + tierIndex * 0.08); // Maximum volume thump
      subGain.gain.setValueAtTime(maxSubGain, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      subOsc.connect(subGain);
      subGain.connect(comp);

      subOsc.start();
      subOsc.stop(now + 0.4);

      // 3. Dynamic White Noise Puff for "Pop/Blast" crunch effect - BOOSTED
      const bufferSize = this.ctx.sampleRate * 0.22; // longer white noise burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filterNode = this.ctx.createBiquadFilter();
      filterNode.type = "bandpass";
      filterNode.frequency.setValueAtTime(600 + tierIndex * 150, now);
      filterNode.Q.setValueAtTime(2.2, now);

      const noiseGain = this.ctx.createGain();
      const maxNoiseGain = Math.min(0.85, 0.3 + tierIndex * 0.07); // Crunchier noise
      noiseGain.gain.setValueAtTime(maxNoiseGain, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noiseNode.connect(filterNode);
      filterNode.connect(noiseGain);
      noiseGain.connect(comp);

      noiseNode.start();
    } catch (e) {
      console.warn("Audio merge failed", e);
    }
  }

  // High pitch combo sound - BOOSTED WITH TRIANGLE HARMONICS
  public playCombo(comboCount: number) {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 440 * Math.pow(1.12, comboCount); // Scale up in pitch

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(baseFreq, now);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(baseFreq * 2, now); // added high harmonic octave

      gain.gain.setValueAtTime(0.55, now); // Up from 0.32
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn("Audio combo failed", e);
    }
  }

  // Fast arpeggiated sweep for achievements - LOUD SWEEP
  public playAchievement() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Extended arpeggio
      const noteDuration = 0.075;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

        gain.gain.setValueAtTime(0.42, now + idx * noteDuration); // Up from 0.08
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * noteDuration + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * noteDuration);
        osc.stop(now + idx * noteDuration + 0.3);
      });
    } catch (e) {
      console.warn("Audio achievement failed", e);
    }
  }

  // Dramatic descending sweep + low hum
  public playGameOver() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 1.4);

      // Low pass filter to make it sound muffled and deep
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + 1.4);

      gain.gain.setValueAtTime(0.48, now); // Much louder
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 1.6);
    } catch (e) {
      console.warn("Audio gameover failed", e);
    }
  }
}

export const gameAudio = new AudioSynthesizer();
