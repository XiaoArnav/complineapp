/**
 * Tarot Cosmos — Realistic Deep-Sky Astrophotography Canvas Engine (JWST / Hubble Deep Field)
 *
 * Aesthetic Philosophy:
 *  - 100% authentic astronomical space: zero cartoon stickers, zero neon donuts, zero strobing stars.
 *  - Over 550 pinpoint stars layered in true astronomical depth (microscopic sub-pixel background,
 *    crisp main-sequence stellar bodies, and rare luminous foreground stellar gems with delicate
 *    JWST 6-point diffraction spikes and diffuse Gaussian bloom).
 *  - Natural stellar classification temperatures: warm ivory/gold, diamond ice-white, ethereal pale blue.
 *  - Hypnagogic stability: stars shine with steady, crisp luminance. Only a tiny fraction (~8%)
 *    gently breathes over a slow 9–16 second sinusoidal wave to induce restfulness.
 *  - Volumetric deep-space nebulae: midnight indigo, deep celestial amethyst, and warm antique gold dust lanes.
 *  - Rare, majestic incandescent shooting stars with tapered plasma ion trails.
 *  - Interactive mouse wake: soft stardust embers and subtle gravitational ripples on click.
 */

class TarotCosmos {
  constructor(canvasId = "tarotCosmosCanvas") {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.ctx = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    this.isRunning = false;
    this.animId = null;

    // Mouse / Pointer Tracking
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;
    this.mouseSpeed = 0;
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.isMouseOver = false;

    // Entities
    this.stars = [];
    this.shootingStars = [];
    this.stardust = [];   // Cursor wake embers
    this.gravWaves = [];  // Click ripples

    // Meteor schedule timer (gentle cadence: 5 - 9 seconds)
    this.nextMeteorTime = this._now() + 2500;

    if (this.canvas) {
      this.init();
    }
  }

  _now() {
    return (typeof window !== "undefined" && window.performance && window.performance.now)
      ? window.performance.now()
      : Date.now();
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.resize();

    this.initStars(560);
    this.bindEvents();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize(), { passive: true });

    const modal = document.getElementById("tarotModal") || window;

    const handlePointerMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : this.width / 2);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : this.height / 2);

      this.targetMouseX = clientX;
      this.targetMouseY = clientY;
      this.isMouseOver = true;

      // Spawn soft stardust wake behind cursor
      if (this.isRunning) {
        const dx = clientX - this.lastMouseX;
        const dy = clientY - this.lastMouseY;
        const dist = Math.hypot(dx, dy);
        this.mouseSpeed = dist;

        if (dist > 6) {
          const spawnCount = Math.min(3, Math.floor(dist / 10) + 1);
          for (let i = 0; i < spawnCount; i++) {
            const spreadX = (Math.random() - 0.5) * 14;
            const spreadY = (Math.random() - 0.5) * 14;
            this.stardust.push({
              x: clientX + spreadX,
              y: clientY + spreadY,
              vx: (Math.random() - 0.5) * 1.2 - dx * 0.08,
              vy: (Math.random() - 0.5) * 1.2 - dy * 0.08,
              size: Math.random() * 1.6 + 0.6,
              color: Math.random() > 0.45 ? "#ffd700" : (Math.random() > 0.5 ? "#f4ebd9" : "#c4a0f5"),
              alpha: 0.85,
              decay: 0.016 + Math.random() * 0.02
            });
          }
        }
      }

      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
    };

    modal.addEventListener("pointermove", handlePointerMove, { passive: true });
    modal.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Click / Tap background for subtle gravitational wave and stardust burst
    const handleCanvasClick = (e) => {
      if (e.target.closest && (e.target.closest(".tarot-3d-card") || e.target.closest(".tarot-3d-toolbar") || e.target.closest("button"))) {
        return;
      }
      const x = e.clientX || this.width / 2;
      const y = e.clientY || this.height / 2;
      this.triggerBurst(x, y);
    };

    modal.addEventListener("click", handleCanvasClick);
  }

  // ─────────────────────────────────────────────────────────────
  // STELLAR ENTITY GENERATION
  // ─────────────────────────────────────────────────────────────
  initStars(count = 560) {
    this.stars = [];

    // Natural astronomical spectral colors (O, B, A, F, G, K, M stellar temperatures)
    const spectralColors = [
      { core: "#ffffff", glow: "rgba(255, 255, 255, 0.40)" }, // Pure White (A-class)
      { core: "#f8f9ff", glow: "rgba(240, 245, 255, 0.35)" }, // Diamond Ice (F-class)
      { core: "#ffe9b8", glow: "rgba(255, 225, 170, 0.30)" }, // Warm Golden Ivory (G/K-class)
      { core: "#ffd485", glow: "rgba(245, 195, 115, 0.30)" }, // Amber Stardust (K-class)
      { core: "#cbe4ff", glow: "rgba(180, 220, 255, 0.35)" }, // Pale Cerulean (B-class)
      { core: "#e2d4ff", glow: "rgba(215, 195, 255, 0.25)" }  // Celestial Violet
    ];

    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 = far, 1 = near

      let baseR, alpha, hasDiffraction = false, hasBreathing = false;
      const colorObj = spectralColors[Math.floor(Math.random() * spectralColors.length)];

      if (depth < 0.65) {
        // 1. Deep Background Micro-Stars (65%): Microscopic sub-pixel pinpricks, 100% steady
        baseR = 0.35 + Math.random() * 0.45;
        alpha = 0.25 + Math.random() * 0.45;
      } else if (depth < 0.93) {
        // 2. Midground Main-Sequence (28%): Crisp sharp stars, steady
        baseR = 0.8 + Math.random() * 0.6;
        alpha = 0.6 + Math.random() * 0.35;
        // ~8% have slow meditative breathing wave (takes 9-16s)
        hasBreathing = Math.random() < 0.12;
      } else {
        // 3. Foreground Stellar Jewels (7%): Luminous telescope-imaged stars
        baseR = 1.4 + Math.random() * 0.9;
        alpha = 0.85 + Math.random() * 0.15;
        hasDiffraction = true; // 6-point JWST/Hubble spikes
        hasBreathing = Math.random() < 0.22;
      }

      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        depth: depth,
        baseR: baseR,
        alpha: alpha,
        color: colorObj.core,
        glowColor: colorObj.glow,
        hasDiffraction: hasDiffraction,
        hasBreathing: hasBreathing,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.0004 + Math.random() * 0.0007 // 9 to 16 seconds per gentle wave
      });
    }
  }

  spawnShootingStar() {
    // Elegant, realistic shooting star
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.45; // ~45 deg diagonal sweep
    const speed = 14 + Math.random() * 9;
    const length = 90 + Math.random() * 100;

    const startFromTop = Math.random() > 0.35;
    const startX = startFromTop ? Math.random() * this.width * 0.85 : -50;
    const startY = startFromTop ? -40 : Math.random() * this.height * 0.5;

    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      width: Math.random() * 1.5 + 1.2,
      color: {
        head: "#ffffff",
        core: "rgba(255, 255, 255, 0.95)",
        mid: "rgba(255, 225, 140, 0.65)",
        tail: "rgba(180, 140, 240, 0)"
      },
      life: 0,
      maxLife: Math.floor(length / speed) + 24,
      sparks: []
    });
  }

  triggerBurst(x, y) {
    // 1. Subtle Gravitational Wave Shockwave
    this.gravWaves.push({
      x: x,
      y: y,
      radius: 8,
      maxRadius: Math.min(this.width, this.height) * 0.32,
      speed: 4.5,
      alpha: 0.65
    });

    // 2. Soft stardust embers
    const burstCount = 14;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.4;
      const spd = Math.random() * 2.8 + 1.0;
      this.stardust.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: Math.random() * 2.0 + 0.8,
        color: Math.random() > 0.5 ? "#ffd700" : "#a8d8ff",
        alpha: 0.95,
        decay: 0.018 + Math.random() * 0.02
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RUNTIME LIFECYCLE
  // ─────────────────────────────────────────────────────────────
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.resize();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    this.animId = requestAnimationFrame(() => this.loop());
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────
  update() {
    const now = this._now();

    // Smooth cursor interpolation (lerp)
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.06;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.06;

    // A. Showering Meteor Scheduler (Calm cadence: 5 - 9 seconds)
    if (now > this.nextMeteorTime) {
      this.spawnShootingStar();
      this.nextMeteorTime = now + (4800 + Math.random() * 4200);
    }

    // B. Update Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;

      // Subtle occasional spark in the wake
      if (Math.random() > 0.6) {
        s.sparks.push({
          x: s.x + (Math.random() - 0.5) * 3,
          y: s.y + (Math.random() - 0.5) * 3,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          alpha: 0.8,
          size: Math.random() * 1.4 + 0.5,
          color: s.color.mid
        });
      }

      for (let j = s.sparks.length - 1; j >= 0; j--) {
        const sp = s.sparks[j];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.035;
        if (sp.alpha <= 0) s.sparks.splice(j, 1);
      }

      if (s.life > s.maxLife || s.x > this.width + 250 || s.y > this.height + 250) {
        this.shootingStars.splice(i, 1);
      }
    }

    // C. Update Stardust Embers
    for (let i = this.stardust.length - 1; i >= 0; i--) {
      const p = this.stardust[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.stardust.splice(i, 1);
      }
    }

    // D. Update Gravitational Waves
    for (let i = this.gravWaves.length - 1; i >= 0; i--) {
      const w = this.gravWaves[i];
      w.radius += w.speed;
      w.alpha -= 0.02;
      if (w.alpha <= 0 || w.radius > w.maxRadius) {
        this.gravWaves.splice(i, 1);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER GRAPHICS
  // ─────────────────────────────────────────────────────────────
  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Deep Space Velvet Void
    ctx.fillStyle = "#030106";
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Parallax offsets based on cursor
    const parallaxX = (this.mouseX - this.width / 2) * 0.035;
    const parallaxY = (this.mouseY - this.height / 2) * 0.035;

    // 2. Volumetric Deep-Sky Astrophotography Nebulae Veils
    this.drawNebulae(ctx, parallaxX, parallaxY);

    // 3. Steady, Crisp Deep-Field Starfield
    this.drawStars(ctx, parallaxX, parallaxY);

    // 4. Subtle Gravitational Shockwaves (on click)
    this.drawGravWaves(ctx);

    // 5. Cinematic Incandescent Shooting Stars
    this.drawShootingStars(ctx);

    // 6. Interactive Cursor Stardust Wake
    this.drawStardust(ctx);
  }

  drawNebulae(ctx, px, py) {
    ctx.save();

    // 1. Vast Midnight Indigo Cosmic Veil (Drifting across mid-space)
    const g1 = ctx.createRadialGradient(
      this.width * 0.28 + px * 0.25, this.height * 0.32 + py * 0.25, 40,
      this.width * 0.28 + px * 0.25, this.height * 0.32 + py * 0.25, Math.max(this.width, this.height) * 0.55
    );
    g1.addColorStop(0, "rgba(22, 38, 85, 0.18)");
    g1.addColorStop(0.45, "rgba(14, 20, 52, 0.10)");
    g1.addColorStop(0.85, "rgba(6, 8, 22, 0.04)");
    g1.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Soft Celestial Amethyst & Deep Violet Dust Cloud (Upper-Right to Center-Left)
    const g2 = ctx.createRadialGradient(
      this.width * 0.74 + px * 0.35, this.height * 0.68 + py * 0.35, 50,
      this.width * 0.74 + px * 0.35, this.height * 0.68 + py * 0.35, Math.max(this.width, this.height) * 0.50
    );
    g2.addColorStop(0, "rgba(82, 28, 112, 0.15)");
    g2.addColorStop(0.40, "rgba(52, 16, 75, 0.08)");
    g2.addColorStop(0.80, "rgba(25, 8, 38, 0.03)");
    g2.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, this.width, this.height);

    // 3. Stardust Gold Filament Dust Lane (Subtle warm interstellar gas)
    const g3 = ctx.createRadialGradient(
      this.width * 0.45 + px * 0.20, this.height * 0.78 + py * 0.20, 30,
      this.width * 0.45 + px * 0.20, this.height * 0.78 + py * 0.20, Math.max(this.width, this.height) * 0.42
    );
    g3.addColorStop(0, "rgba(212, 168, 55, 0.09)");
    g3.addColorStop(0.35, "rgba(165, 110, 32, 0.04)");
    g3.addColorStop(0.75, "rgba(60, 35, 10, 0.015)");
    g3.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, this.width, this.height);

    // 4. Secondary Faint Ethereal Lagoon Veil (Far top-left)
    const g4 = ctx.createRadialGradient(
      this.width * 0.15 + px * 0.15, this.height * 0.15 + py * 0.15, 20,
      this.width * 0.15 + px * 0.15, this.height * 0.15 + py * 0.15, Math.max(this.width, this.height) * 0.35
    );
    g4.addColorStop(0, "rgba(42, 65, 120, 0.12)");
    g4.addColorStop(0.5, "rgba(20, 30, 65, 0.05)");
    g4.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.restore();
  }

  drawStars(ctx, px, py) {
    ctx.save();
    const time = this._now();

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      // Gentle parallax based on astronomical depth
      const sx = s.x + px * s.depth * 0.8;
      const sy = s.y + py * s.depth * 0.8;

      let currentAlpha = s.alpha;
      let currentR = s.baseR;

      if (s.hasBreathing) {
        // Slow, soothing 9–16s wave, NOT a strobe
        const wave = Math.sin(time * s.breathSpeed + s.breathPhase);
        currentAlpha = Math.max(0.35, Math.min(1.0, s.alpha + wave * 0.18));
        currentR = s.baseR * (0.92 + wave * 0.08);
      }

      // Draw Star Core
      ctx.beginPath();
      ctx.arc(sx, sy, currentR, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = currentAlpha;
      ctx.fill();

      // Optical Bloom & Delicate JWST 6-Point Spikes for Luminous Foreground Stars
      if (s.hasDiffraction) {
        // 1. Soft photographic Gaussian bloom halo
        const glowR = currentR * 3.8;
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        glow.addColorStop(0, s.glowColor);
        glow.addColorStop(0.4, s.glowColor.replace(/[\d\.]+\)$/, "0.15)"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // 2. Delicate, razor-thin 6-point diffraction spikes (JWST / Hubble style)
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.55;
        ctx.globalAlpha = currentAlpha * 0.32;
        const spikeLen = currentR * 5.2;

        ctx.beginPath();
        // Horizontal & Vertical
        ctx.moveTo(sx - spikeLen, sy);
        ctx.lineTo(sx + spikeLen, sy);
        ctx.moveTo(sx, sy - spikeLen);
        ctx.lineTo(sx, sy + spikeLen);
        // Diagonal secondary axes
        const dX = spikeLen * 0.65;
        const dY = spikeLen * 0.38;
        ctx.moveTo(sx - dX, sy - dY);
        ctx.lineTo(sx + dX, sy + dY);
        ctx.moveTo(sx - dX, sy + dY);
        ctx.lineTo(sx + dX, sy - dY);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawShootingStars(ctx) {
    ctx.save();
    this.shootingStars.forEach((s) => {
      const speed = Math.hypot(s.vx, s.vy);
      const normVx = s.vx / speed;
      const normVy = s.vy / speed;

      const tailX = s.x - normVx * s.length;
      const tailY = s.y - normVy * s.length;

      // Realistic tapered plasma trail gradient
      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, s.color.tail);
      grad.addColorStop(0.65, s.color.mid);
      grad.addColorStop(0.92, s.color.core);
      grad.addColorStop(1, s.color.head);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.stroke();

      // Bright white-hot incandescence at nucleus head
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.width * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Sparks in wake
      s.sparks.forEach((sp) => {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = Math.max(0, sp.alpha * 0.7);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    });
    ctx.restore();
  }

  drawStardust(ctx) {
    ctx.save();
    for (let i = 0; i < this.stardust.length; i++) {
      const p = this.stardust[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha * 0.75);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawGravWaves(ctx) {
    ctx.save();
    this.gravWaves.forEach((w) => {
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(212, 175, 55, ${Math.max(0, w.alpha * 0.45)})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w.x, w.y, Math.max(0, w.radius - 14), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 220, 255, ${Math.max(0, w.alpha * 0.25)})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
    });
    ctx.restore();
  }
}

function initTarotCosmos() {
  if (!window.tarotCosmos) {
    window.tarotCosmos = new TarotCosmos("tarotCosmosCanvas");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTarotCosmos);
} else {
  initTarotCosmos();
}
