/**
 * Candle Sound Engine — All sounds synthesized via Web Audio API
 * Zero external files: match strike, candle crackle, wind blow-out, relight.
 */

class CandleSoundEngine {
  constructor() {
    this.ctx = null;
  }

  _init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Pre-allocate cached quill noise buffer for ultra-fast, garbage-free streaming typing
    if (!this.quillBuffer && this.ctx) {
      const bSize = Math.floor(this.ctx.sampleRate * 0.035);
      this.quillBuffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const d = this.quillBuffer.getChannelData(0);
      for (let i = 0; i < bSize; i++) {
        d[i] = (Math.random() * 2 - 1) * 0.12;
      }
    }

    return this.ctx;
  }

  /** Match strike: short sharp brown-noise burst with hi-freq sparkle, then settles */
  playMatchStrike() {
    const ctx = this._init();
    const t = ctx.currentTime;

    // ── main noise burst ──
    const bufSize = ctx.sampleRate * 0.18;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSize; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.1 * w) / 1.1;          // brown noise
      d[i] = last * 12 + w * 0.4;             // mostly brown + sparkle white
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    // band-pass around 3 kHz for scratch texture
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.8;

    // hi-shelf for sparkle
    const hs = ctx.createBiquadFilter();
    hs.type = 'highshelf'; hs.frequency.value = 6000; hs.gain.value = 10;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.9, t + 0.008);   // instant attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17); // quick decay

    src.connect(bp); bp.connect(hs); hs.connect(gain); gain.connect(ctx.destination);
    src.start(t); src.stop(t + 0.2);

    // ── secondary low thud (phosphorus igniting) ──
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.07);
    const ogain = ctx.createGain();
    ogain.gain.setValueAtTime(0.4, t);
    ogain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(ogain); ogain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.1);
  }

  /** Soft candle catch: warm crackle as wick takes flame */
  playCandleCatch() {
    const ctx = this._init();
    const t = ctx.currentTime;

    // Two overlapping crackle pops
    for (let pop = 0; pop < 2; pop++) {
      const delay = pop * 0.14;
      const bSize = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bSize);

      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(t + delay); src.stop(t + delay + 0.08);
    }
  }

  /** Wind blow-out: shaped swoosh of turbulence followed by wick-smoke hiss */
  playWindBlowOut() {
    const ctx = this._init();
    const t = ctx.currentTime;

    // ── fast whoosh ──
    const bSize = Math.floor(ctx.sampleRate * 0.55);
    const buf = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0;
    for (let i = 0; i < bSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = b0 * 0.98 + w * 0.02;
      b1 = b1 * 0.94 + w * 0.06;
      d[i] = b0 * 3 + b1 * 2 + w * 0.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    // band-pass around 400 Hz — wind "whomp"
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 0.5;
    bp.frequency.linearRampToValueAtTime(160, t + 0.55);  // pitch drops

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.7, t + 0.05);
    g.gain.setValueAtTime(0.7, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + 0.6);

    // ── sizzle / extinguish hiss (wick dying) ──
    const bSize2 = Math.floor(ctx.sampleRate * 0.4);
    const buf2 = ctx.createBuffer(1, bSize2, ctx.sampleRate);
    const d2 = buf2.getChannelData(0);
    for (let i = 0; i < bSize2; i++) d2[i] = Math.random() * 2 - 1;
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 5000;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.18, t + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    src2.connect(hp); hp.connect(g2); g2.connect(ctx.destination);
    src2.start(t + 0.1); src2.stop(t + 0.55);
  }

  /** Wind re-light: gentler whoosh then immediate candle catch */
  playWindRelight() {
    const ctx = this._init();
    const t = ctx.currentTime;

    // short soft whoosh
    const bSize = Math.floor(ctx.sampleRate * 0.3);
    const buf = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < bSize; i++) {
      const w = Math.random() * 2 - 1;
      b = b * 0.96 + w * 0.04;
      d[i] = b * 4 + w * 0.3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + 0.35);

    // candle catch follows
    setTimeout(() => this.playCandleCatch(), 280);
  }

  /** Delicate Monastic Quill Scratch on Vellum */
  playQuillScratch(volume = 0.05) {
    try {
      const ctx = this._init();
      if (!ctx || !this.quillBuffer) return;
      const t = ctx.currentTime;

      const src = ctx.createBufferSource();
      src.buffer = this.quillBuffer;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2600 + Math.random() * 800;
      bp.Q.value = 4.0;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(volume, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

      src.connect(bp);
      bp.connect(g);
      g.connect(ctx.destination);

      src.start(t);
      src.stop(t + 0.035);
    } catch (e) {}
  }
}

window.candleSound = new CandleSoundEngine();
