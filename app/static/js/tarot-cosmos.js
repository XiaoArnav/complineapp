/**
 * Tarot Cosmos — Live Interactive 3D Deep-Sky Astrophotography Engine
 *
 * Features:
 *  - Real 3D Cartesian coordinates (x, y, z) with Euler perspective projection (Yaw & Pitch)
 *  - 100% live and interactive:
 *    • Continuous live 3D cosmic drift (stars slowly glide through 3D space)
 *    • 3D mouse orbit: cursor movement tilts the 3D celestial camera with silky lerp damping
 *    • Dynamic gravitational lens: stars near the cursor gently curve and illuminate
 *    • 3D gravitational shockwave on click with oscillating stellar displacement
 *    • 3D stardust particle wake
 *  - Authentic JWST / Hubble deep-field realism:
 *    • Microscopic deep background pinpricks (zero strobing)
 *    • Main-sequence stellar bodies with natural spectral temperatures (ice-white, ivory gold, cerulean)
 *    • Luminous foreground gems with soft Gaussian bloom and 6-point JWST diffraction spikes
 *  - Layered volumetric deep-sky nebulae veils (midnight indigo, royal amethyst, antique gold dust)
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

    // 3D Camera Rotation State (Euler Yaw & Pitch)
    this.rotX = 0;        // Pitch
    this.rotY = 0;        // Yaw
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.focalLength = 950; // Perspective camera depth
    this.driftSpeed = 0.45; // Live 3D forward drift speed

    // Mouse / Pointer Tracking
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.isMouseOver = false;

    // 3D Entities
    this.stars = [];
    this.shootingStars = [];
    this.stardust = [];   // 3D cursor wake embers
    this.gravWaves = [];  // Click shockwaves

    // Meteor schedule timer
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

    this.init3DStars(560);
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

      // 3D Camera Orbit Target (Yaw & Pitch)
      const cx = this.width / 2;
      const cy = this.height / 2;
      const normX = (clientX - cx) / cx;
      const normY = (clientY - cy) / cy;

      this.targetRotY = normX * 0.42;  // ~24 deg 3D horizontal yaw
      this.targetRotX = -normY * 0.32; // ~18 deg 3D vertical pitch

      // Spawn soft 3D stardust wake
      if (this.isRunning) {
        const dx = clientX - this.lastMouseX;
        const dy = clientY - this.lastMouseY;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
          const spawnCount = Math.min(3, Math.floor(dist / 9) + 1);
          for (let i = 0; i < spawnCount; i++) {
            this.stardust.push({
              x: clientX + (Math.random() - 0.5) * 16,
              y: clientY + (Math.random() - 0.5) * 16,
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

    // Click / Tap background for 3D Gravitational Shockwave
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
  // 3D STELLAR FIELD INITIALIZATION
  // ─────────────────────────────────────────────────────────────
  init3DStars(count = 560) {
    this.stars = [];

    // Natural astronomical spectral colors (O, B, A, F, G, K, M stellar temperatures)
    const spectralColors = [
      { core: "#ffffff", glow: "rgba(255, 255, 255, 0.45)" }, // Pure White (A-class)
      { core: "#f8f9ff", glow: "rgba(240, 245, 255, 0.40)" }, // Diamond Ice (F-class)
      { core: "#ffe9b8", glow: "rgba(255, 225, 170, 0.35)" }, // Warm Golden Ivory (G/K-class)
      { core: "#ffd485", glow: "rgba(245, 195, 115, 0.35)" }, // Amber Stardust (K-class)
      { core: "#cbe4ff", glow: "rgba(180, 220, 255, 0.40)" }, // Pale Cerulean (B-class)
      { core: "#e2d4ff", glow: "rgba(215, 195, 255, 0.30)" }  // Celestial Violet
    ];

    for (let i = 0; i < count; i++) {
      // 3D Cartesian coordinates spread across a deep celestial volume
      const x = (Math.random() - 0.5) * 3400;
      const y = (Math.random() - 0.5) * 2400;
      const z = -350 + Math.random() * 2600; // z: -350 (near foreground) to 2250 (deep void)

      const depth = (z + 350) / 2600; // 0 = closest, 1 = farthest

      let baseR, alpha, hasDiffraction = false, hasBreathing = false;
      const colorObj = spectralColors[Math.floor(Math.random() * spectralColors.length)];

      if (depth > 0.45) {
        // Deep background micro-stars (crisp, steady pinpricks)
        baseR = 0.45 + Math.random() * 0.45;
        alpha = 0.30 + Math.random() * 0.45;
      } else if (depth > 0.12) {
        // Midground main-sequence stars
        baseR = 0.85 + Math.random() * 0.65;
        alpha = 0.65 + Math.random() * 0.30;
        hasBreathing = Math.random() < 0.12;
      } else {
        // Luminous foreground gems (JWST 6-point spikes)
        baseR = 1.45 + Math.random() * 0.85;
        alpha = 0.85 + Math.random() * 0.15;
        hasDiffraction = true;
        hasBreathing = Math.random() < 0.25;
      }

      this.stars.push({
        x: x,
        y: y,
        z: z,
        baseR: baseR,
        alpha: alpha,
        color: colorObj.core,
        glowColor: colorObj.glow,
        hasDiffraction: hasDiffraction,
        hasBreathing: hasBreathing,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.0004 + Math.random() * 0.0006, // 10–16 second meditative breathing
        driftSpeed: 0.25 + (1 - depth) * 0.35,        // Foreground moves faster
        // Projected cache
        px: 0,
        py: 0,
        scale: 1,
        visible: true
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3D PERSPECTIVE PROJECTION
  // ─────────────────────────────────────────────────────────────
  project(x, y, z, cx, cy, cosX, sinX, cosY, sinY) {
    // 1. Yaw rotation around Y axis
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // 2. Pitch rotation around X axis
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // 3. Perspective focal projection
    const distance = this.focalLength;
    const denom = distance + z2;
    if (denom <= 20) {
      return { px: 0, py: 0, scale: 0, visible: false, z: z2 };
    }

    const scale = distance / denom;
    const px = cx + x1 * scale;
    const py = cy + y2 * scale;

    const margin = 70;
    return {
      px,
      py,
      scale,
      visible: px >= -margin && px <= this.width + margin && py >= -margin && py <= this.height + margin,
      z: z2
    };
  }

  spawnShootingStar() {
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.45;
    const speed = 15 + Math.random() * 9;
    const length = 95 + Math.random() * 105;

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
    // 1. 3D Gravitational Shockwave
    this.gravWaves.push({
      x: x,
      y: y,
      radius: 8,
      maxRadius: Math.min(this.width, this.height) * 0.35,
      speed: 5.5,
      alpha: 0.75
    });

    // 2. 3D Stardust Burst
    const burstCount = 16;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.35;
      const spd = Math.random() * 3.2 + 1.2;
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
  // UPDATE 3D PHYSICS
  // ─────────────────────────────────────────────────────────────
  update() {
    const now = this._now();

    // 1. Smooth 3D Camera Orbit Interpolation (Lerp)
    this.rotX += (this.targetRotX - this.rotX) * 0.065;
    this.rotY += (this.targetRotY - this.rotY) * 0.065;

    // 2. Smooth Cursor Tracking
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    // 3. Live 3D Cosmic Drift (Stars continuously glide forward in depth)
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.z -= s.driftSpeed;
      // Loop stars smoothly from near foreground to deep cosmic horizon
      if (s.z < -350) {
        s.z = 2250;
        s.x = (Math.random() - 0.5) * 3400;
        s.y = (Math.random() - 0.5) * 2400;
      }
    }

    // 4. Meteor Scheduler
    if (now > this.nextMeteorTime) {
      this.spawnShootingStar();
      this.nextMeteorTime = now + (4800 + Math.random() * 4200);
    }

    // 5. Update Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;

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

    // 6. Update Stardust Embers
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

    // 7. Update Gravitational Waves
    for (let i = this.gravWaves.length - 1; i >= 0; i--) {
      const w = this.gravWaves[i];
      w.radius += w.speed;
      w.alpha -= 0.022;
      if (w.alpha <= 0 || w.radius > w.maxRadius) {
        this.gravWaves.splice(i, 1);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER 3D GRAPHICS
  // ─────────────────────────────────────────────────────────────
  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Deep Space Velvet Void
    ctx.fillStyle = "#030106";
    ctx.fillRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);

    // 2. Volumetric Deep-Sky Astrophotography Nebulae Veils (Tilting in 3D)
    this.drawNebulae(ctx, cx, cy, cosY, sinY, cosX, sinX);

    // 3. Live Interactive 3D Starfield
    this.draw3DStars(ctx, cx, cy, cosX, sinX, cosY, sinY);

    // 4. Gravitational Shockwaves (on click)
    this.drawGravWaves(ctx);

    // 5. Incandescent Shooting Stars
    this.drawShootingStars(ctx);

    // 6. Cursor Stardust Wake
    this.drawStardust(ctx);
  }

  drawNebulae(ctx, cx, cy, cosY, sinY, cosX, sinX) {
    ctx.save();
    // 3D Parallax offset for nebulae veils
    const nebOffX = sinY * 180;
    const nebOffY = -sinX * 140;

    // A. Vast Midnight Indigo Cosmic Veil
    const g1 = ctx.createRadialGradient(
      this.width * 0.28 + nebOffX * 0.5, this.height * 0.32 + nebOffY * 0.5, 40,
      this.width * 0.28 + nebOffX * 0.5, this.height * 0.32 + nebOffY * 0.5, Math.max(this.width, this.height) * 0.55
    );
    g1.addColorStop(0, "rgba(22, 38, 85, 0.18)");
    g1.addColorStop(0.45, "rgba(14, 20, 52, 0.10)");
    g1.addColorStop(0.85, "rgba(6, 8, 22, 0.04)");
    g1.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, this.width, this.height);

    // B. Soft Celestial Amethyst & Deep Violet Dust Cloud
    const g2 = ctx.createRadialGradient(
      this.width * 0.74 + nebOffX * 0.7, this.height * 0.68 + nebOffY * 0.7, 50,
      this.width * 0.74 + nebOffX * 0.7, this.height * 0.68 + nebOffY * 0.7, Math.max(this.width, this.height) * 0.50
    );
    g2.addColorStop(0, "rgba(82, 28, 112, 0.15)");
    g2.addColorStop(0.40, "rgba(52, 16, 75, 0.08)");
    g2.addColorStop(0.80, "rgba(25, 8, 38, 0.03)");
    g2.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, this.width, this.height);

    // C. Stardust Gold Filament Dust Lane
    const g3 = ctx.createRadialGradient(
      this.width * 0.45 + nebOffX * 0.35, this.height * 0.78 + nebOffY * 0.35, 30,
      this.width * 0.45 + nebOffX * 0.35, this.height * 0.78 + nebOffY * 0.35, Math.max(this.width, this.height) * 0.42
    );
    g3.addColorStop(0, "rgba(212, 168, 55, 0.09)");
    g3.addColorStop(0.35, "rgba(165, 110, 32, 0.04)");
    g3.addColorStop(0.75, "rgba(60, 35, 10, 0.015)");
    g3.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, this.width, this.height);

    // D. Faint Ethereal Lagoon Veil (Far top-left)
    const g4 = ctx.createRadialGradient(
      this.width * 0.15 + nebOffX * 0.25, this.height * 0.15 + nebOffY * 0.25, 20,
      this.width * 0.15 + nebOffX * 0.25, this.height * 0.15 + nebOffY * 0.25, Math.max(this.width, this.height) * 0.35
    );
    g4.addColorStop(0, "rgba(42, 65, 120, 0.12)");
    g4.addColorStop(0.5, "rgba(20, 30, 65, 0.05)");
    g4.addColorStop(1, "rgba(3, 1, 6, 0)");
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.restore();
  }

  draw3DStars(ctx, cx, cy, cosX, sinX, cosY, sinY) {
    ctx.save();
    const time = this._now();

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // Project 3D Cartesian coordinates to screen plane
      const p = this.project(s.x, s.y, s.z, cx, cy, cosX, sinX, cosY, sinY);
      if (!p.visible) continue;

      s.px = p.px;
      s.py = p.py;
      s.scale = p.scale;

      // ── Live Mouse Gravitational Deflection & Illuminating Lens ──
      const dx = p.px - this.mouseX;
      const dy = p.py - this.mouseY;
      const dist = Math.hypot(dx, dy);

      let drawX = p.px;
      let drawY = p.py;
      let extraLuminance = 0;

      if (dist < 180 && dist > 1) {
        // Subtle gravitational lensing curvature away from cursor
        const lensForce = Math.pow((180 - dist) / 180, 2) * 16 * Math.min(1.4, p.scale);
        drawX += (dx / dist) * lensForce;
        drawY += (dy / dist) * lensForce;
        // Cursor proximity gently illuminates nearby stars
        extraLuminance = ((180 - dist) / 180) * 0.35;
      }

      // Gravitational Wave Ripple Displacement
      for (let w = 0; w < this.gravWaves.length; w++) {
        const wave = this.gravWaves[w];
        const wDist = Math.hypot(drawX - wave.x, drawY - wave.y);
        const waveDelta = Math.abs(wDist - wave.radius);
        if (waveDelta < 35) {
          const wavePush = Math.sin((waveDelta / 35) * Math.PI) * 7 * wave.alpha;
          if (wDist > 1) {
            drawX += ((drawX - wave.x) / wDist) * wavePush;
            drawY += ((drawY - wave.y) / wDist) * wavePush;
          }
          extraLuminance = Math.min(1.0, extraLuminance + wave.alpha * 0.4);
        }
      }

      // Scale-scaled 3D radius and alpha
      const scaledR = Math.max(0.3, s.baseR * p.scale);
      let currentAlpha = Math.min(1.0, s.alpha * Math.min(1.2, p.scale * 1.1) + extraLuminance);

      if (s.hasBreathing) {
        const wave = Math.sin(time * s.breathSpeed + s.breathPhase);
        currentAlpha = Math.max(0.35, Math.min(1.0, currentAlpha + wave * 0.15));
      }

      // Draw 3D Star Nucleus
      ctx.beginPath();
      ctx.arc(drawX, drawY, scaledR, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = currentAlpha;
      ctx.fill();

      // Optical Bloom & Delicate JWST 6-Point Spikes for Luminous Stars
      if (s.hasDiffraction && p.scale > 0.8) {
        // 1. Soft photographic Gaussian bloom halo
        const glowR = scaledR * 3.8;
        const glow = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowR);
        glow.addColorStop(0, s.glowColor);
        glow.addColorStop(0.4, s.glowColor.replace(/[\d\.]+\)$/, "0.15)"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(drawX, drawY, glowR, 0, Math.PI * 2);
        ctx.fill();

        // 2. Delicate, razor-thin 6-point diffraction spikes (JWST / Hubble style)
        ctx.strokeStyle = s.color;
        ctx.lineWidth = Math.max(0.4, 0.55 * p.scale);
        ctx.globalAlpha = currentAlpha * 0.32;
        const spikeLen = scaledR * 5.4;

        ctx.beginPath();
        // Horizontal & Vertical
        ctx.moveTo(drawX - spikeLen, drawY);
        ctx.lineTo(drawX + spikeLen, drawY);
        ctx.moveTo(drawX, drawY - spikeLen);
        ctx.lineTo(drawX, drawY + spikeLen);
        // Diagonal secondary axes
        const dX = spikeLen * 0.65;
        const dY = spikeLen * 0.38;
        ctx.moveTo(drawX - dX, drawY - dY);
        ctx.lineTo(drawX + dX, drawY + dY);
        ctx.moveTo(drawX - dX, drawY + dY);
        ctx.lineTo(drawX + dX, drawY - dY);
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

      // Incandescent nucleus
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
