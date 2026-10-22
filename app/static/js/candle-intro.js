/**
 * Candle Intro & Lifecycle Controller
 * 
 * Cinematic Flow:
 * 1. Pitch-black obsidian void
 * 2. Burning coal embers drift in the air; a destiny ember flies in along a curved aerodynamic path
 * 3. Ember strikes the dry cotton wick tip: spark explosion & smoldering wick
 * 4. Sukuna's Flame Arrow (開 / Kamino) divine flame eruption: expanding shockwave, soaring twin arrow blades
 * 5. Sacred illumination floods the room; background 3D celestial map emerges dreamily blurred
 * 6. Smooth landing into the cathedral sanctuary as blur clarifies
 * 
 * Zero external audio or image dependencies — synthesized Web Audio + Canvas 2D + SVG.
 */

class IntroEmberEngine {
  constructor(canvas, onWickImpact, onSukunaBurst) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onWickImpact = onWickImpact;
    this.onSukunaBurst = onSukunaBurst;
    this.rafId = null;
    this.active = false;

    this.ambientEmbers = [];
    this.impactSparks = [];
    this.shockwaves = [];
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

    // Spawn 28 ambient floating coal ember particles
    for (let i = 0; i < 28; i++) {
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
      vx: (Math.random() * 0.5 - 0.2) + 0.35, // gentle drift to the right
      vy: (Math.random() * 0.6 - 0.3) - 0.15, // gentle upward heat float
      size: 1.2 + Math.random() * 2.2,
      maxLife: 240 + Math.random() * 320,
      life: Math.random() * 200,
      flickerFreq: 0.05 + Math.random() * 0.08,
      baseAlpha: 0.35 + Math.random() * 0.5
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
      e.x += e.vx + Math.sin(e.life * 0.04) * 0.25;
      e.y += e.vy + Math.cos(e.life * 0.03) * 0.15;

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

      // Spawn burning coal trail sparks
      for (let s = 0; s < 3; s++) {
        this.destinyEmber.trail.push({
          x: pos.x + (Math.random() * 6 - 3),
          y: pos.y + (Math.random() * 6 - 3),
          vx: -(Math.random() * 1.5 + 0.5),
          vy: (Math.random() * 1.2 - 0.6),
          size: 1.0 + Math.random() * 1.8,
          alpha: 0.9,
          decay: 0.035 + Math.random() * 0.03
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
      sp.vx *= 0.94; // air resistance
      sp.vy = sp.vy * 0.94 + 0.12; // gravity
      sp.alpha -= sp.decay;
      if (sp.alpha <= 0) {
        this.impactSparks.splice(i, 1);
      }
    }

    // 4. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= sw.decay;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  _triggerWickImpact(target) {
    // 1. Spawn 42 high-velocity incandescent impact sparks
    for (let i = 0; i < 42; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 9.5;
      this.impactSparks.push({
        x: target.x,
        y: target.y,
        prevX: target.x,
        prevY: target.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 2.5 + 1.0),
        size: 1.2 + Math.random() * 2.4,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.025,
        hue: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#ffbb22' : '#ff4400')
      });
    }

    // Notify controller of cotton wick impact
    if (this.onWickImpact) this.onWickImpact(target);

    // 2. Sukuna's Flame Arrow (開 / Kamino) Divine Eruption after 90ms condensation
    setTimeout(() => {
      if (!this.active) return;
      this._triggerSukunaShockwave(target);
      if (this.onSukunaBurst) this.onSukunaBurst(target);
    }, 90);
  }

  _triggerSukunaShockwave(target) {
    // Primary incandescent circular shockwave
    this.shockwaves.push({
      x: target.x,
      y: target.y,
      radius: 6,
      maxRadius: Math.min(this.width, this.height) * 0.48,
      speed: 18,
      alpha: 1.0,
      decay: 0.028,
      lineWidth: 4.5,
      color: '#ffffff',
      outerColor: '#ff6600'
    });

    // Secondary deep crimson heat pulse
    this.shockwaves.push({
      x: target.x,
      y: target.y,
      radius: 2,
      maxRadius: Math.min(this.width, this.height) * 0.36,
      speed: 12,
      alpha: 0.85,
      decay: 0.022,
      lineWidth: 8.0,
      color: '#ffbb00',
      outerColor: '#cc1100'
    });

    // 24 Radial fiery lightning/flame energy streaks
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() * 0.2 - 0.1);
      const speed = 7.0 + Math.random() * 12.0;
      this.impactSparks.push({
        x: target.x,
        y: target.y,
        prevX: target.x,
        prevY: target.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.0 + Math.random() * 2.8,
        alpha: 1.0,
        decay: 0.028 + Math.random() * 0.02,
        hue: '#fff7a0'
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
      const alpha = Math.max(0.08, Math.min(1.0, e.baseAlpha + flicker * 0.3));

      const grad = this.ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2.8);
      grad.addColorStop(0, `rgba(255, 245, 200, ${alpha})`);
      grad.addColorStop(0.35, `rgba(255, 130, 20, ${alpha * 0.85})`);
      grad.addColorStop(0.75, `rgba(200, 30, 0, ${alpha * 0.45})`);
      grad.addColorStop(1, 'rgba(100, 0, 0, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.size * 2.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Draw Destiny Ember Trail
    if (this.destinyEmber && this.destinyEmber.trail.length > 0) {
      for (let i = 0; i < this.destinyEmber.trail.length; i++) {
        const tr = this.destinyEmber.trail[i];
        this.ctx.fillStyle = `rgba(255, 140, 25, ${tr.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(tr.x, tr.y, tr.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 3. Draw Destiny Ember (The flying hot coal particle)
    if (this.destinyEmber && !this.destinyEmber.hasImpacted && this.destinyEmber.currentPos) {
      const pos = this.destinyEmber.currentPos;

      // Searing coal outer aura
      const auraGrad = this.ctx.createRadialGradient(pos.x, pos.y, 1, pos.x, pos.y, 22);
      auraGrad.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
      auraGrad.addColorStop(0.25, 'rgba(255, 165, 30, 0.85)');
      auraGrad.addColorStop(0.65, 'rgba(220, 45, 0, 0.45)');
      auraGrad.addColorStop(1, 'rgba(120, 0, 0, 0)');

      this.ctx.fillStyle = auraGrad;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
      this.ctx.fill();

      // Incandescent burning coal core
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, 3.2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 4. Draw Impact Sparks (High-speed incandescent streaks)
    this.ctx.lineWidth = 1.6;
    for (let i = 0; i < this.impactSparks.length; i++) {
      const sp = this.impactSparks[i];
      this.ctx.strokeStyle = sp.hue || `rgba(255, 180, 50, ${sp.alpha})`;
      this.ctx.beginPath();
      this.ctx.moveTo(sp.prevX, sp.prevY);
      this.ctx.lineTo(sp.x, sp.y);
      this.ctx.stroke();

      // Spark head point
      this.ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.size * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 5. Draw Sukuna Shockwaves
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.lineWidth = sw.lineWidth;
      this.ctx.shadowColor = sw.outerColor;
      this.ctx.shadowBlur = 18;
      this.ctx.stroke();
      this.ctx.restore();
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
          (target) => this._onSukunaBurst(target)
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

    // 1. Scene 1: Pitch-Black Silence (350ms of quiet void)
    setTimeout(() => {
      // 2. Scene 2: Burning Coal Ember flies in with the wind
      try {
        if (window.candleSound) window.candleSound.playEmberTravel();
      } catch (e) {}

      if (this.emberEngine) {
        this.emberEngine.start(wickTarget);
      }
    }, 350);
  }

  _onWickImpact(target) {
    // 3. Scene 3: Burning Coal strikes the cotton wick tip
    const candleWrap = this.overlay ? this.overlay.querySelector('.intro-candle-wrap') : null;
    if (candleWrap) {
      candleWrap.classList.add('wick-smoldering');
    }

    // Audio: Crisp cotton impact snap
    try {
      if (window.candleSound) window.candleSound.playWickStrike();
    } catch (e) {}
  }

  _onSukunaBurst(target) {
    const candleWrap = this.overlay ? this.overlay.querySelector('.intro-candle-wrap') : null;
    const introFlame = document.getElementById('introFlame');

    // 4. Scene 4: Sukuna's Flame Arrow (開 / Kamino) Divine Ignition
    if (introFlame) {
      introFlame.style.display = 'block';
      introFlame.removeAttribute('display');
      introFlame.style.opacity = '1';
      introFlame.style.visibility = 'visible';
    }

    if (candleWrap) {
      candleWrap.classList.add('flame-on');
      candleWrap.classList.add('sukuna-erupt');
    }

    // Audio: Deep sub-bass cosmic shockwave & roaring divine fire
    try {
      if (window.candleSound) window.candleSound.playKaminoBurst();
    } catch (e) {}

    // Background 3D stellar universe reacts with cosmic bloom
    try {
      if (window.stellarMap) window.stellarMap.triggerCelestialBloom();
    } catch (e) {}

    // 5. Scene 5: Sacred Illumination floods the darkness (700ms after burst)
    setTimeout(() => {
      if (!this.overlay) return;
      if (candleWrap) {
        candleWrap.classList.remove('sukuna-erupt');
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

      // 6. Scene 6: Smooth Landing to Main Sanctuary (1800ms of blurred wonder)
      setTimeout(() => {
        this._landToSanctuary();
      }, 1800);

    }, 700);
  }

  _landToSanctuary() {
    if (this.introPlayed) return;
    this.introPlayed = true;

    // Blur clarifies smoothly to sharp view
    if (this.veil) {
      this.veil.classList.remove('veil-revealed');
      this.veil.classList.add('veil-landing');
    }

    // Intro overlay dissolves smoothly
    if (this.overlay) {
      this.overlay.classList.add('dissolve');
      this.overlay.style.pointerEvents = 'none';
    }

    // Main sanctuary cards fade in
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
    // If user clicks during the intro, smoothly accelerate to ignition/landing
    if (!this.introPlayed) {
      // Resume audio context on user gesture if browser suspended it
      try {
        if (window.candleSound && window.candleSound.ctx && window.candleSound.ctx.state === 'suspended') {
          window.candleSound.ctx.resume();
        }
      } catch (e) {}

      const introFlame = document.getElementById('introFlame');
      const isFlameAlreadyLit = introFlame && introFlame.style.display === 'block';

      if (!isFlameAlreadyLit) {
        // Instant ignite
        const target = this._getWickCoordinates();
        this._onWickImpact(target);
        this._onSukunaBurst(target);
      } else {
        // Fast-forward to landing
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
