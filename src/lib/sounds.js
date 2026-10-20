/**
 * Procedural Web Audio API sound synthesizer for tactile micro-interactions.
 * Zero external audio files, zero network latency, WCAG respectful with mute persistence.
 */

const STORAGE_KEY = 'gastosaurus_sound_enabled';

const DINO_SOUND_FILES = [
  '/sounds/dino-chirp.mp3',
  '/sounds/dino-rawr.mp3',
  '/sounds/dino-pop.mp3',
];

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = this.getInitialState();
    this.audioPool = {};
    this.soundIndex = 0;
  }

  getInitialState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isEnabled() {
    return this.enabled;
  }

  toggle() {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playClick();
    }
    return this.enabled;
  }

  setEnabled(val) {
    this.enabled = !!val;
    try {
      localStorage.setItem(STORAGE_KEY, String(this.enabled));
    } catch {
      /* ignore */
    }
  }

  /**
   * Crisp, tactile mechanical switch click for buttons and toggles.
   */
  playClick(freq = 900) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      /* ignore audio context restrictions */
    }
  }

  /**
   * Soft rounded bubble pop for chip selection and category filters.
   */
  playPop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.06);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      /* ignore */
    }
  }

  /**
   * Plays a cute dinosaur sound effect (alternating between rawr, chirp, pop)
   * with automatic procedural Web Audio fallback.
   */
  playCuteDino(specificIndex = null) {
    if (!this.enabled) return;
    try {
      this.init();
      const idx = specificIndex !== null
        ? Math.abs(specificIndex) % DINO_SOUND_FILES.length
        : this.soundIndex % DINO_SOUND_FILES.length;
      this.soundIndex = (this.soundIndex + 1) % DINO_SOUND_FILES.length;

      const src = DINO_SOUND_FILES[idx];
      let audio = this.audioPool[src];
      if (!audio && typeof Audio !== 'undefined') {
        audio = new Audio(src);
        audio.preload = 'auto';
        this.audioPool[src] = audio;
      }

      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.85;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.playCuteDinoSynth();
          });
        }
      } else {
        this.playCuteDinoSynth();
      }
    } catch {
      this.playCuteDinoSynth();
    }
  }

  /**
   * Procedural baby dinosaur formant chirp synthesizer.
   * Zero-latency, zero-bandwidth fallback.
   */
  playCuteDinoSynth() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Cute creature formant chirp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(1250, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.16);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.08);
      filter.Q.value = 4.5;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      /* ignore audio context restrictions */
    }
  }

  /**
   * Playful double-tone dinosaur chomp/chirp for mascot interactions.
   */
  playChomp() {
    this.playCuteDino();
  }

  /**
   * Ascending melodic chime for completed settlements and saved expenses.
   */
  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * 0.065;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.07, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.25);
      });
    } catch {
      /* ignore */
    }
  }
}

export const sounds = new SoundEngine();
