// Web Audio API Procedural Synthesizer for CITY LIFE
// 100% generated sounds - no external MP3 dependencies, instant load and zero CORS errors!

class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Engine sound nodes
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning = false;

  // Tire screech
  private screechGain: GainNode | null = null;
  private screechFilter: BiquadFilterNode | null = null;

  // Horn
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;
  private hornGain: GainNode | null = null;

  // Ambience
  private ambientGain: GainNode | null = null;

  // Radio beat generator
  private isRadioPlaying = false;
  private radioStation = 0; // 0: Synthwave 80s, 1: Cyber Club, 2: Sunset Chill
  private radioTimer: number | null = null;
  private beatStep = 0;

  private isMuted = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.initEngineNodes();
      this.initScreechNodes();
      this.initAmbientNodes();
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private initEngineNodes() {
    if (!this.ctx || !this.sfxGain) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = 'triangle';
    this.engineSubOsc.frequency.setValueAtTime(22.5, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineSubOsc.connect(subGain);
    subGain.connect(this.engineFilter);

    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc.start();
    this.engineSubOsc.start();
  }

  private initScreechNodes() {
    if (!this.ctx || !this.sfxGain) return;

    // Procedural noise buffer for tires
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    this.screechFilter = this.ctx.createBiquadFilter();
    this.screechFilter.type = 'bandpass';
    this.screechFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    this.screechFilter.Q.setValueAtTime(5.0, this.ctx.currentTime);

    this.screechGain = this.ctx.createGain();
    this.screechGain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(this.screechFilter);
    this.screechFilter.connect(this.screechGain);
    this.screechGain.connect(this.sfxGain);

    whiteNoise.start();
  }

  private initAmbientNodes() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise
      lastOut = data[i];
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = buffer;
    brownNoise.loop = true;

    const ambientFilter = this.ctx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    brownNoise.connect(ambientFilter);
    ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    brownNoise.start();
  }

  // Update vehicle engine sound based on throttle and speed
  public updateEngine(speedKmH: number, throttle: number, maxSpeed = 220) {
    if (!this.ctx || !this.engineGain || !this.engineOsc || !this.engineFilter) return;

    if (!this.isEngineRunning) {
      this.engineGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.1);
      this.isEngineRunning = true;
    }

    const normSpeed = Math.min(1, Math.abs(speedKmH) / maxSpeed);
    const gear = Math.min(5, Math.floor(normSpeed * 5) + 1);
    const gearProgress = (normSpeed * 5) % 1;

    // Base pitch + gear RPM simulation
    const baseFreq = 40 + gearProgress * 95 + (throttle > 0 ? 25 : 0);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, this.ctx.currentTime, 0.05);
    }

    // Filter opens up when accelerating
    const cutoff = 300 + normSpeed * 1200 + (throttle > 0 ? 800 : 0);
    this.engineFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.05);

    // Volume adjustment
    const vol = 0.15 + (throttle > 0 ? 0.25 : 0.08) + normSpeed * 0.2;
    this.engineGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.08);
  }

  public stopEngine() {
    if (this.ctx && this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      this.isEngineRunning = false;
    }
  }

  public updateTireScreech(slipAmount: number) {
    if (!this.ctx || !this.screechGain) return;
    const vol = Math.min(0.4, Math.max(0, (slipAmount - 0.25) * 0.7));
    this.screechGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
  }

  // Horn
  public startHorn() {
    if (!this.ctx || !this.sfxGain || this.hornGain) return;

    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.hornOsc1 = this.ctx.createOscillator();
    this.hornOsc2 = this.ctx.createOscillator();

    this.hornOsc1.type = 'sawtooth';
    this.hornOsc2.type = 'sawtooth';

    this.hornOsc1.frequency.setValueAtTime(430, this.ctx.currentTime); // F#
    this.hornOsc2.frequency.setValueAtTime(538, this.ctx.currentTime); // C#

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, this.ctx.currentTime);

    this.hornOsc1.connect(filter);
    this.hornOsc2.connect(filter);
    filter.connect(this.hornGain);
    this.hornGain.connect(this.sfxGain);

    this.hornOsc1.start();
    this.hornOsc2.start();
  }

  public stopHorn() {
    if (this.hornGain && this.ctx) {
      this.hornGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      setTimeout(() => {
        try {
          this.hornOsc1?.stop();
          this.hornOsc2?.stop();
        } catch {
          // ignore
        }
        this.hornOsc1 = null;
        this.hornOsc2 = null;
        this.hornGain = null;
      }, 60);
    }
  }

  // Nitro Boost Sound
  public playNitroSound() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.6);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  // Footstep click
  public playFootstep() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80 + Math.random() * 30, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Cash Register "Cha-Ching"
  public playCashSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [987.77, 1318.51, 1567.98]; // B5, E6, G6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.09 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.4);
    });
  }

  // Mission Complete / Victory Arpeggio
  public playMissionCompleteSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.6);
    });
  }

  // UI Click
  public playClick() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // In-Game Procedural Radio Beat Synthesizer
  public toggleRadio(stationIndex?: number) {
    if (stationIndex !== undefined) {
      this.radioStation = stationIndex;
      if (!this.isRadioPlaying) {
        this.startRadio();
      }
      return this.radioStation;
    }

    if (this.isRadioPlaying) {
      this.stopRadio();
      return -1;
    } else {
      this.startRadio();
      return this.radioStation;
    }
  }

  public getRadioState() {
    return {
      isPlaying: this.isRadioPlaying,
      station: this.radioStation,
      stationName: ['CityWave 80s', 'Cyber Beats FM', 'Sunset Chillhop'][this.radioStation]
    };
  }

  private startRadio() {
    if (this.radioTimer) clearInterval(this.radioTimer);
    this.isRadioPlaying = true;
    this.beatStep = 0;

    const tempo = this.radioStation === 0 ? 120 : this.radioStation === 1 ? 128 : 95;
    const stepInterval = (60 / tempo) * 250; // 16th notes

    this.radioTimer = window.setInterval(() => {
      this.playRadioStep();
      this.beatStep = (this.beatStep + 1) % 16;
    }, stepInterval);
  }

  public stopRadio() {
    if (this.radioTimer) {
      clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
    this.isRadioPlaying = false;
  }

  private playRadioStep() {
    if (!this.ctx || !this.musicGain || !this.isRadioPlaying) return;
    const now = this.ctx.currentTime;

    // Kick on steps 0, 4, 8, 12
    if (this.beatStep % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.frequency.setValueAtTime(140, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
      kickGain.gain.setValueAtTime(0.4, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);
    }

    // Snare / Clap on 4, 12
    if (this.beatStep === 4 || this.beatStep === 12) {
      const snareOsc = this.ctx.createOscillator();
      const snareGain = this.ctx.createGain();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(220, now);
      snareGain.gain.setValueAtTime(0.2, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      snareOsc.connect(snareGain);
      snareGain.connect(this.musicGain);
      snareOsc.start(now);
      snareOsc.stop(now + 0.15);
    }

    // Hi-hat on every odd step
    if (this.beatStep % 2 === 1) {
      const hatOsc = this.ctx.createOscillator();
      const hatGain = this.ctx.createGain();
      hatOsc.type = 'sawtooth';
      hatOsc.frequency.setValueAtTime(4500, now);
      hatGain.gain.setValueAtTime(0.06, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      hatOsc.connect(hatGain);
      hatGain.connect(this.musicGain);
      hatOsc.start(now);
      hatOsc.stop(now + 0.04);
    }

    // Melodic synth arp note
    const synthNotes = [220, 261.63, 293.66, 329.63, 392.00, 440];
    const note = synthNotes[(this.beatStep * 2 + this.radioStation * 3) % synthNotes.length];
    const synthOsc = this.ctx.createOscillator();
    const synthGain = this.ctx.createGain();
    synthOsc.type = 'sawtooth';
    synthOsc.frequency.setValueAtTime(note, now);
    synthGain.gain.setValueAtTime(0.08, now);
    synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    synthOsc.connect(synthGain);
    synthGain.connect(this.musicGain);
    synthOsc.start(now);
    synthOsc.stop(now + 0.18);
  }

  public setVolume(sfx: number, music: number) {
    if (!this.ctx) return;
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(music, this.ctx.currentTime, 0.05);
  }
}

export const SoundFX = new SoundSystem();
