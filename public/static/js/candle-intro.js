/**
 * Candle Intro & Lifecycle Controller
 * 
 * Cinematic Flow:
 * 1. Pitch-black obsidian void
 * 2. Burning coal embers drift peacefully; a gentle destiny ember glides in along an aerodynamic curve
 * 3. Warm contact with dry cotton wick tip: soft golden sparks and incandescent cotton glow
 * 4. Serene Sacred Flame Awakening: single harmonious teardrop blooms gently like a golden lotus
 * 5. Sacred illumination floods the room; background 3D celestial map emerges dreamily blurred
 * 6. Smooth landing into cathedral sanctuary as blur clarifies into crystal vision
 * 
 * Zero external audio or image dependencies — Web Audio (432Hz) + Canvas 2D + SVG.
 */

class IntroEmberEngine {
  constructor(canvas, onWickImpact, onFlameBloom) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onWickImpact = onWickImpact;
    this.onFlameBloom = onFlameBloom;
    this.rafId = null;
    this.active = false;

    this.ambientEmbers = [];
    this.impactSparks = [];
    this.shockwaves = [];
    this.peaceMotes = [];
    this.destinyEmber = null;
    this.time = 0;

    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  start(wickTarget) {
    this.stop();
    this.active = true;
    this.time = 0;
    this.wickTarget = wickTarget;
    this.ambientEmbers = [];
    this.impactSparks = [];
    this.shockwaves = [];
    this.peaceMotes = [];

    // Spawn 24 gentle ambient floating coal ember particles
    for (let i = 0; i < 24; i++) {
      this.ambientEmbers.push(this._createAmbientEmber());
    }

    // Initialize the primary burning coal ember (the destiny spark)
    const startX = Math.max(40, this.width * 0.12 + (Math.random() * 80 - 40));
    const startY = Math.max(50, this.height * 0.22 + (Math.random() * 60 - 30));

    // Curved aerodynamic trajectory control points
    const cp1X = startX + (wickTarget.x - startX) * 0.28;
    const cp1Y = startY - (Math.min(220, this.height * 0.28));
    const cp2X = startX + (wickTarget.x - startX) * 0.72;
    const cp2Y = wickTarget.y - 70;

    this.destinyEmber = {
      p0: { x: startX, y: startY },
      p1: { x: cp1X, y: cp1Y },
      p2: { x: cp2X, y: cp2Y },
      p3: { x: wickTarget.x, y: wickTarget.y },
      progress: 0,
      duration: 1380, // ms flight time
      startTime: null,
      trail: [],
      hasImpacted: false
    };

    let lastTimestamp = performance.now();
    const loop = (now) => {
      if (!this.active) return;
      const dt = Math.min(48, now - lastTimestamp);
      lastTimestamp = now;
      this._update(dt, now);
      this._render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  _createAmbientEmber() {
    return {
      x: Math.random() * (this.width || 800),
      y: Math.random() * (this.height || 600),
      vx: (Math.random() * 0.4 - 0.15) + 0.28, // gentle drift to the right
      vy: (Math.random() * 0.5 - 0.25) - 0.12, // gentle upward heat float
      size: 1.2 + Math.random() * 2.0,
      maxLife: 260 + Math.random() * 320,
      life: Math.random() * 200,
      flickerFreq: 0.04 + Math.random() * 0.06,
      baseAlpha: 0.32 + Math.random() * 0.45
    };
  }

  _bezier(t, p0, p1, p2, p3) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  _update(dt, now) {
    this.time += dt;

    // 1. Update ambient drifting embers
    for (let i = 0; i < this.ambientEmbers.length; i++) {
      const e = this.ambientEmbers[i];
      e.life += 1;
      e.x += e.vx + Math.sin(e.life * 0.035) * 0.22;
      e.y += e.vy + Math.cos(e.life * 0.025) * 0.12;

      // Wrap around edges
      if (e.x > this.width + 20) e.x = -20;
      if (e.x < -20) e.x = this.width + 20;
      if (e.y < -20) e.y = this.height + 20;
      if (e.y > this.height + 20) e.y = -20;
      if (e.life >= e.maxLife) {
        Object.assign(e, this._createAmbientEmber(), { life: 0 });
      }
    }

    // 2. Update Destiny Ember flight
    if (this.destinyEmber && !this.destinyEmber.hasImpacted) {
      if (!this.destinyEmber.startTime) this.destinyEmber.startTime = now;
      const elapsed = now - this.destinyEmber.startTime;
      const rawT = Math.min(1.0, elapsed / this.destinyEmber.duration);

      // Smooth acceleration with gentle easing
      const t = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
      this.destinyEmber.progress = t;

      const pos = this._bezier(t, this.destinyEmber.p0, this.destinyEmber.p1, this.destinyEmber.p2, this.destinyEmber.p3);
      this.destinyEmber.currentPos = pos;

      // Spawn soft burning coal trail sparks
      for (let s = 0; s < 2; s++) {
        this.destinyEmber.trail.push({
          x: pos.x + (Math.random() * 4 - 2),
          y: pos.y + (Math.random() * 4 - 2),
          vx: -(Math.random() * 1.2 + 0.3),
          vy: (Math.random() * 0.8 - 0.4),
          size: 0.9 + Math.random() * 1.5,
          alpha: 0.85,
          decay: 0.032 + Math.random() * 0.025
        });
      }

      // Check impact at destination
      if (rawT >= 1.0) {
        this.destinyEmber.hasImpacted = true;
        this._triggerWickImpact(this.destinyEmber.p3);
      }
    }

    // Update trail particles
    if (this.destinyEmber) {
      for (let i = this.destinyEmber.trail.length - 1; i >= 0; i--) {
        const tr = this.destinyEmber.trail[i];
        tr.x += tr.vx;
        tr.y += tr.vy;
        tr.alpha -= tr.decay;
        if (tr.alpha <= 0) {
          this.destinyEmber.trail.splice(i, 1);
        }
      }
    }

    // 3. Update Impact Sparks
    for (let i = this.impactSparks.length - 1; i >= 0; i--) {
      const sp = this.impactSparks[i];
      sp.prevX = sp.x;
      sp.prevY = sp.y;
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vx *= 0.93; // air resistance
      sp.vy = sp.vy * 0.93 + 0.08; // gentle gravity
      sp.alpha -= sp.decay;
      if (sp.alpha <= 0) {
        this.impactSparks.splice(i, 1);
      }
    }

    // 4. Update Peaceful Ripples
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= sw.decay;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 5. Update Peace Motes (Gentle upward floating warm fireflies)
    for (let i = this.peaceMotes.length - 1; i >= 0; i--) {
      const pm = this.peaceMotes[i];
      pm.life += 1;
      pm.x += pm.vx + Math.sin(pm.life * pm.swaySpeed) * pm.swayAmp;
      pm.y += pm.vy;
      pm.alpha -= pm.decay;
      if (pm.alpha <= 0 || pm.y < -20) {
        this.peaceMotes.splice(i, 1);
      }
    }
  }

  _triggerWickImpact(target) {
    // Spawn 16 gentle warm golden sparks bouncing softly off the cotton wick
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 4.2;
      this.impactSparks.push({
        x: target.x,
        y: target.y,
        prevX: target.x,
        prevY: target.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 1.5 + 0.5),
        size: 1.0 + Math.random() * 1.8,
        alpha: 0.95,
        decay: 0.022 + Math.random() * 0.02,
        hue: Math.random() > 0.4 ? '#fff4b8' : '#ffaa33'
      });
    }

    // Notify controller of cotton wick contact
    if (this.onWickImpact) this.onWickImpact(target);

    // Serene flame awakening after 100ms
    setTimeout(() => {
      if (!this.active) return;
      this._triggerPeacefulBloom(target);
      if (this.onFlameBloom) this.onFlameBloom(target);
    }, 100);
  }

  _triggerPeacefulBloom(target) {
    // 1. Serene Golden Ripple of Peace
    this.shockwaves.push({
      x: target.x,
      y: target.y,
      radius: 4,
      maxRadius: Math.min(this.width, this.height) * 0.38,
      speed: 6.2, // slow, serene expansion
      alpha: 0.85,
      decay: 0.015,
      lineWidth: 2.2,
      color: 'rgba(255, 225, 140, 0.85)',
      outerColor: 'rgba(255, 170, 50, 0.5)'
    });

    // 2. Warm floating golden peace motes (gently ascending fireflies of tranquility)
    for (let i = 0; i < 18; i++) {
      this.peaceMotes.push({
        x: target.x + (Math.random() * 10 - 5),
        y: target.y - 10 - (Math.random() * 14),
        vx: (Math.random() * 0.5 - 0.25),
        vy: -(0.5 + Math.random() * 1.0), // gently floats upward
        size: 1.2 + Math.random() * 1.8,
        alpha: 0.9,
        decay: 0.007 + Math.random() * 0.007,
        swaySpeed: 0.035 + Math.random() * 0.035,
        swayAmp: 0.3 + Math.random() * 0.4,
        life: Math.random() * 60
      });
    }
  }

  _render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw ambient floating coal ember particles
    for (let i = 0; i < this.ambientEmbers.length; i++) {
      const e = this.ambientEmbers[i];
      const flicker = Math.sin(e.life * e.flickerFreq);
      const alpha = Math.max(0.08, Math.min(1.0, e.baseAlpha + flicker * 0.25));

      const grad = this.ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2.6);
      grad.addColorStop(0, `rgba(255, 245, 200, ${alpha})`);
      grad.addColorStop(0.35, `rgba(255, 130, 20, ${alpha * 0.85})`);
      grad.addColorStop(0.75, `rgba(200, 30, 0, ${alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(100, 0, 0, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.size * 2.6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Draw Destiny Ember Trail
    if (this.destinyEmber && this.destinyEmber.trail.length > 0) {
      for (let i = 0; i < this.destinyEmber.trail.length; i++) {
        const tr = this.destinyEmber.trail[i];
        this.ctx.fillStyle = `rgba(255, 145, 30, ${tr.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(tr.x, tr.y, tr.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 3. Draw Destiny Ember (The flying warm coal particle)
    if (this.destinyEmber && !this.destinyEmber.hasImpacted && this.destinyEmber.currentPos) {
      const pos = this.destinyEmber.currentPos;

      // Soft warm outer aura
      const auraGrad = this.ctx.createRadialGradient(pos.x, pos.y, 1, pos.x, pos.y, 20);
      auraGrad.addColorStop(0, 'rgba(255, 255, 240, 0.92)');
      auraGrad.addColorStop(0.25, 'rgba(255, 170, 35, 0.8)');
      auraGrad.addColorStop(0.65, 'rgba(220, 50, 0, 0.4)');
      auraGrad.addColorStop(1, 'rgba(120, 0, 0, 0)');

      this.ctx.fillStyle = auraGrad;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      this.ctx.fill();

      // Incandescent burning coal core
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, 2.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 4. Draw Impact Sparks (Soft, gentle warm spark flecks)
    this.ctx.lineWidth = 1.3;
    for (let i = 0; i < this.impactSparks.length; i++) {
      const sp = this.impactSparks[i];
      this.ctx.strokeStyle = sp.hue || `rgba(255, 190, 60, ${sp.alpha})`;
      this.ctx.beginPath();
      this.ctx.moveTo(sp.prevX, sp.prevY);
      this.ctx.lineTo(sp.x, sp.y);
      this.ctx.stroke();

      this.ctx.fillStyle = `rgba(255, 255, 240, ${sp.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.size * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 5. Draw Peaceful Ripples (Gentle circular waves of light)
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.lineWidth = sw.lineWidth;
      this.ctx.shadowColor = sw.outerColor;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 6. Draw Peace Motes (Warm ascending fireflies of comfort)
    for (let i = 0; i < this.peaceMotes.length; i++) {
      const pm = this.peaceMotes[i];
      const grad = this.ctx.createRadialGradient(pm.x, pm.y, 0, pm.x, pm.y, pm.size * 2.4);
      grad.addColorStop(0, `rgba(255, 255, 235, ${pm.alpha})`);
      grad.addColorStop(0.35, `rgba(255, 205, 80, ${pm.alpha * 0.85})`);
      grad.addColorStop(0.8, `rgba(255, 140, 25, ${pm.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 100, 0, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(pm.x, pm.y, pm.size * 2.4, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}

class CandleIntro {
  constructor() {
    this.lit = false;
    this.introPlayed = false;
    this.overlay = document.getElementById('introOverlay');
    this.veil = document.getElementById('introCelestialVeil');
    this.canvas = document.getElementById('introEmberCanvas');
    this.mainContent = document.getElementById('mainContent');
    this.candleWrapper = document.getElementById('candleWrapper');
    this.emberEngine = null;

    this._handleCandleClick = this._handleCandleClick.bind(this);
    this._handleOverlayInteraction = this._handleOverlayInteraction.bind(this);
  }

  start() {
    this.restart();
  }

  restart() {
    this.lit = false;
    this.introPlayed = false;

    // Reset main content
    if (this.mainContent) {
      this.mainContent.style.opacity = '0';
      this.mainContent.classList.remove('fade-in-lit');
    }

    // Reset overlay & veil
    if (this.overlay) {
      this.overlay.style.display = 'flex';
      this.overlay.style.opacity = '1';
      this.overlay.classList.remove('dissolve');

      if (this.veil) {
        this.veil.className = 'intro-celestial-veil';
      }

      const candleWrap = this.overlay.querySelector('.intro-candle-wrap');
      if (candleWrap) {
        candleWrap.className = 'intro-candle-wrap';
      }

      const introFlame = document.getElementById('introFlame');
      if (introFlame) {
        introFlame.style.display = 'none';
        introFlame.setAttribute('display', 'none');
        introFlame.style.opacity = '0';
        introFlame.style.visibility = 'hidden';
      }

      const smolder = document.getElementById('introWickSmolder');
      if (smolder) {
        smolder.style.opacity = '0';
      }
    }

    // Attach interaction listener for skipping or instant ignite
    if (this.overlay) {
      this.overlay.removeEventListener('pointerdown', this._handleOverlayInteraction);
      this.overlay.addEventListener('pointerdown', this._handleOverlayInteraction);
    }

    // Initialize or re-create Ember Canvas Engine
    if (this.canvas) {
      if (!this.emberEngine) {
        this.emberEngine = new IntroEmberEngine(
          this.canvas,
          (target) => this._onWickImpact(target),
          (target) => this._onFlameBloom(target)
        );
      } else {
        this.emberEngine.stop();
      }
    }

    setTimeout(() => this._playIntro(), 200);
  }

  _getWickCoordinates() {
    const wickEl = document.getElementById('introColdWick') || document.getElementById('introWickCottonTip');
    if (wickEl) {
      const rect = wickEl.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.45,
        y: rect.top + 4
      };
    }
    // Fallback to center-screen offset if element rect not available
    return {
      x: window.innerWidth / 2 - 1,
      y: window.innerHeight / 2 - 22
    };
  }

  _playIntro() {
    // Calculate exact wick tip coordinates
    const wickTarget = this._getWickCoordinates();

    // Set CSS variable for flame center position so radial blur matches exactly
    const flameXPercent = (wickTarget.x / window.innerWidth) * 100;
    const flameYPercent = (wickTarget.y / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--flame-center-x', `${flameXPercent.toFixed(1)}%`);
    document.documentElement.style.setProperty('--flame-center-y', `${flameYPercent.toFixed(1)}%`);

    // 1. Scene 1: Pitch-Black Silence (350ms of quiet meditative void)
    setTimeout(() => {
      // 2. Scene 2: Burning Coal Ember glides in with gentle air
      try {
        if (window.candleSound) window.candleSound.playEmberTravel();
      } catch (e) {}

      if (this.emberEngine) {
        this.emberEngine.start(wickTarget);
      }
    }, 350);
  }

  _onWickImpact(target) {
    // 3. Scene 3: Burning Coal warms the cotton wick tip
    const candleWrap = this.overlay ? this.overlay.querySelector('.intro-candle-wrap') : null;
    if (candleWrap) {
      candleWrap.classList.add('wick-smoldering');
    }

    // Audio: Delicate cotton contact tone
    try {
      if (window.candleSound) window.candleSound.playWickStrike();
    } catch (e) {}
  }

  _onFlameBloom(target) {
    const candleWrap = this.overlay ? this.overlay.querySelector('.intro-candle-wrap') : null;
    const introFlame = document.getElementById('introFlame');

    // 4. Scene 4: Single Pure Candle Flame Blooms Gently
    if (introFlame) {
      introFlame.style.display = 'block';
      introFlame.removeAttribute('display');
      introFlame.style.opacity = '1';
      introFlame.style.visibility = 'visible';
    }

    if (candleWrap) {
      candleWrap.classList.add('flame-on');
      candleWrap.classList.add('flame-blooming');
    }

    // Audio: Serene 432Hz Tibetan singing bowl chime & soft breath of fire
    try {
      if (window.candleSound) window.candleSound.playKaminoBurst();
    } catch (e) {}

    // Background 3D stellar universe reacts with cosmic bloom
    try {
      if (window.stellarMap) window.stellarMap.triggerCelestialBloom();
    } catch (e) {}

    // 5. Scene 5: Sacred Illumination floods the darkness (850ms after bloom)
    setTimeout(() => {
      if (!this.overlay) return;
      if (candleWrap) {
        candleWrap.classList.remove('flame-blooming');
        candleWrap.classList.add('flame-settled');
        candleWrap.classList.add('halo-expand');
      }

      // Atmospheric Celestial Veil reveals background stellar map dreamily blurred
      if (this.veil) {
        this.veil.classList.add('veil-revealed');
      }

      try {
        if (window.stellarMap) window.stellarMap.triggerCelestialBloom();
      } catch (e) {}

      // 6. Scene 6: Smooth Landing to Main Sanctuary (1800ms of blurred peace)
      setTimeout(() => {
        this._landToSanctuary();
      }, 1800);

    }, 850);
  }

  _landToSanctuary() {
    if (this.introPlayed) return;
    this.introPlayed = true;

    // Blur clarifies smoothly to sharp crystal view
    if (this.veil) {
      this.veil.classList.remove('veil-revealed');
      this.veil.classList.add('veil-landing');
    }

    // Intro overlay dissolves smoothly
    if (this.overlay) {
      this.overlay.classList.add('dissolve');
      this.overlay.style.pointerEvents = 'none';
    }

    // Main sanctuary cards fade in with golden warmth
    if (this.mainContent) {
      this.mainContent.classList.add('fade-in-lit');
    }

    // Cleanup overlay & activate interactive sidebar candle
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
        this.overlay.style.visibility = 'hidden';
      }
      if (this.emberEngine) {
        this.emberEngine.stop();
      }
      this.lit = true;
      this._attachCandleListener();
    }, 1200);
  }

  _handleOverlayInteraction() {
    if (!this.introPlayed) {
      try {
        if (window.candleSound && window.candleSound.ctx && window.candleSound.ctx.state === 'suspended') {
          window.candleSound.ctx.resume();
        }
      } catch (e) {}

      const introFlame = document.getElementById('introFlame');
      const isFlameAlreadyLit = introFlame && introFlame.style.display === 'block';

      if (!isFlameAlreadyLit) {
        const target = this._getWickCoordinates();
        this._onWickImpact(target);
        this._onFlameBloom(target);
      } else {
        this._landToSanctuary();
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INTERACTIVE SIDEBAR CANDLE SHRINE
  // ─────────────────────────────────────────────────────────────
  _attachCandleListener() {
    const wrapper = document.getElementById('candleWrapper');
    if (wrapper) wrapper.addEventListener('click', this._handleCandleClick);
  }

  _handleCandleClick() {
    if (!this.introPlayed) return;

    if (this.lit) {
      this._blowOut();
    } else {
      this._relight();
    }
  }

  _blowOut() {
    this.lit = false;
    try { if (window.candleSound) window.candleSound.playWindBlowOut(); } catch (e) {}

    const wrapper = document.getElementById('candleWrapper');
    if (wrapper) {
      wrapper.classList.add('wind-puff');
      wrapper.classList.add('candle-dead');
      setTimeout(() => wrapper.classList.remove('wind-puff'), 600);
    }

    const flame = document.getElementById('mainCandleFlame');
    if (flame) flame.classList.add('flame-dead');

    const wickLit  = document.getElementById('wickLit');
    const wickGlow = document.getElementById('wickGlow');
    const wickDead = document.getElementById('wickDead');
    const charTip  = document.getElementById('charTip');
    if (wickLit)  wickLit.classList.add('wick-hide');
    if (wickGlow) wickGlow.classList.add('wick-hide');
    if (wickDead) wickDead.classList.add('wick-show');
    if (charTip)  charTip.classList.add('char-show');

    const waxBody = document.getElementById('waxBody');
    if (waxBody) waxBody.classList.add('wax-dead');

    const halo = document.getElementById('candleHalo');
    if (halo) halo.classList.add('halo-dead');

    const smoke = document.getElementById('smokeContainer');
    if (smoke) {
      smoke.classList.remove('smoke-active');
      smoke.querySelectorAll('.smoke-wisp').forEach(w => {
        const clone = w.cloneNode(true);
        w.parentNode.replaceChild(clone, w);
      });
      void smoke.offsetWidth;
      smoke.classList.add('smoke-active');
      setTimeout(() => smoke.classList.remove('smoke-active'), 4300);
    }

    document.body.classList.add('gothic-dark-mode');
    if (window.stellarMap) {
      const rect = wrapper ? wrapper.getBoundingClientRect() : null;
      const px = rect ? rect.left + rect.width / 2 : window.innerWidth * 0.75;
      const py = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.35;
      window.stellarMap.triggerGravitationalPulse(px, py);
    }

    const statusEl = document.getElementById('candleStatus');
    if (statusEl) statusEl.textContent = 'The flame sleeps — click to wake the wind';
  }

  _relight() {
    this.lit = true;
    try { if (window.candleSound) window.candleSound.playWindRelight(); } catch (e) {}

    const wrapper = document.getElementById('candleWrapper');
    if (wrapper) {
      wrapper.classList.add('wind-puff');
      wrapper.classList.remove('candle-dead');
      setTimeout(() => wrapper.classList.remove('wind-puff'), 600);
    }

    const smoke = document.getElementById('smokeContainer');
    if (smoke) smoke.classList.remove('smoke-active');

    const wickLit  = document.getElementById('wickLit');
    const wickGlow = document.getElementById('wickGlow');
    const wickDead = document.getElementById('wickDead');
    const charTip  = document.getElementById('charTip');
    if (wickLit)  wickLit.classList.remove('wick-hide');
    if (wickGlow) wickGlow.classList.remove('wick-hide');
    if (wickDead) wickDead.classList.remove('wick-show');
    if (charTip)  charTip.classList.remove('char-show');

    const waxBody = document.getElementById('waxBody');
    if (waxBody) waxBody.classList.remove('wax-dead');

    const halo = document.getElementById('candleHalo');
    if (halo) halo.classList.remove('halo-dead');

    const flame = document.getElementById('mainCandleFlame');
    if (flame) {
      flame.classList.remove('flame-dead');
      flame.classList.add('flame-reborn');
      try { if (window.stellarMap) window.stellarMap.triggerCelestialBloom(); } catch (e) {}
      setTimeout(() => flame.classList.remove('flame-reborn'), 800);
    }

    document.body.classList.remove('gothic-dark-mode');

    const statusEl = document.getElementById('candleStatus');
    if (statusEl) statusEl.textContent = 'Beeswax flame lit — click to blow it out';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.candleIntro = new CandleIntro();
  window.restartIntro = () => window.candleIntro.restart();
  window.candleIntro.start();
});
