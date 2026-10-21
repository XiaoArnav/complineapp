/**
 * Tarot Cosmos — Live Interactive Deep Space Canvas Engine
 * Renders an immersive celestial universe behind the 3D Tarot Sanctuary:
 *  - Dynamic showering shooting stars & meteor storms with incandescent trails
 *  - Rotating Spiral & Barred deep space galaxies with luminous dust arms
 *  - Small Black Holes with event horizons, Einstein photon rings & relativistic accretion disks
 *  - Ringed exoplanet and deep volumetric nebulae
 *  - Live mouse interactivity: gravitational stardust cursor wake, gravity lensing,
 *    and click-triggered cosmic starbursts & gravitational wave shockwaves.
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

    // Interactive Entities
    this.stars = [];
    this.shootingStars = [];
    this.stardust = []; // Cursor wake embers
    this.gravWaves = []; // Click shockwaves
    this.galaxies = [];
    this.blackHoles = [];
    this.exoplanet = null;

    // Meteor shower schedule timer
    this.nextMeteorTime = this._now() + 400;

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

    this.initStars(360);
    this.initGalaxies();
    this.initBlackHoles();
    this.initExoplanet();
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

      // Spawn stardust wake behind cursor
      if (this.isRunning) {
        const dx = clientX - this.lastMouseX;
        const dy = clientY - this.lastMouseY;
        const dist = Math.hypot(dx, dy);
        this.mouseSpeed = dist;

        if (dist > 4) {
          const spawnCount = Math.min(6, Math.floor(dist / 6) + 1);
          for (let i = 0; i < spawnCount; i++) {
            const spread = (Math.random() - 0.5) * 16;
            const spreadY = (Math.random() - 0.5) * 16;
            this.stardust.push({
              x: clientX + spread,
              y: clientY + spreadY,
              vx: (Math.random() - 0.5) * 1.8 - dx * 0.12,
              vy: (Math.random() - 0.5) * 1.8 - dy * 0.12,
              size: Math.random() * 2.2 + 0.8,
              color: Math.random() > 0.4 ? "#ffd700" : (Math.random() > 0.5 ? "#a0e8ff" : "#da70d6"),
              alpha: 0.95,
              decay: 0.02 + Math.random() * 0.03
            });
          }
        }
      }

      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
    };

    modal.addEventListener("pointermove", handlePointerMove, { passive: true });
    modal.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Click / Tap background for Cosmic Burst
    const handleCanvasClick = (e) => {
      // Don't trigger if clicking card or toolbar buttons
      if (e.target.closest && (e.target.closest(".tarot-3d-card") || e.target.closest(".tarot-3d-toolbar") || e.target.closest("button"))) {
        return;
      }
      const x = e.clientX || this.width / 2;
      const y = e.clientY || this.height / 2;
      this.triggerCosmicBurst(x, y);
    };

    if (this.canvas) {
      this.canvas.addEventListener("click", handleCanvasClick);
      this.canvas.addEventListener("touchend", (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const t = e.changedTouches[0];
          handleCanvasClick({ clientX: t.clientX, clientY: t.clientY, target: e.target });
        }
      });
    }

    modal.addEventListener("mouseleave", () => {
      this.isMouseOver = false;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ENTITY INITIALIZATION
  // ─────────────────────────────────────────────────────────────
  initStars(count) {
    this.stars = [];
    const colors = [
      "#ffffff", "#f8f9fa", "#d0e8ff", "#a8d8ff",
      "#ffd700", "#ffea88", "#e0b0ff", "#ffccd5"
    ];

    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 (far) to 1 (near)
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        depth: depth,
        baseR: depth < 0.6 ? 0.6 + Math.random() * 0.8 : (depth < 0.9 ? 1.4 + Math.random() * 1.0 : 2.4 + Math.random() * 1.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.018 + Math.random() * 0.045,
        hasSpikes: depth > 0.88 && Math.random() > 0.55
      });
    }
  }

  initGalaxies() {
    this.galaxies = [
      // 1. Grand Andromeda Spiral Galaxy (Upper Left)
      {
        relX: 0.18,
        relY: 0.28,
        coreRadius: 28,
        armCount: 2,
        particleCount: 180,
        tiltScaleY: 0.54,
        rotAngle: -0.55,
        spinSpeed: 0.0016,
        coreColors: ["#ffffff", "#ffe9a0", "#8e44ad", "#1a0826"],
        particles: []
      },
      // 2. Barred Violet Galaxy (Lower Right)
      {
        relX: 0.82,
        relY: 0.74,
        coreRadius: 22,
        armCount: 3,
        particleCount: 140,
        tiltScaleY: 0.46,
        rotAngle: 0.78,
        spinSpeed: -0.0012,
        coreColors: ["#ffffff", "#a0e8ff", "#da70d6", "#11051e"],
        particles: []
      }
    ];

    // Populate galaxy arm particles (logarithmic spirals)
    this.galaxies.forEach((g) => {
      g.particles = [];
      for (let i = 0; i < g.particleCount; i++) {
        const armIndex = i % g.armCount;
        const armOffset = (armIndex / g.armCount) * Math.PI * 2;
        const progress = (i / g.particleCount) * 1.0;
        const dist = 14 + Math.pow(progress, 0.8) * 110;
        const spiralAngle = armOffset + progress * 3.4;
        const jitterDist = (Math.random() - 0.5) * (12 + progress * 24);
        const jitterAngle = Math.random() * Math.PI * 2;

        const x = Math.cos(spiralAngle) * dist + Math.cos(jitterAngle) * jitterDist;
        const y = Math.sin(spiralAngle) * dist + Math.sin(jitterAngle) * jitterDist;

        g.particles.push({
          relDist: dist,
          angle: spiralAngle,
          jitterX: Math.cos(jitterAngle) * jitterDist,
          jitterY: Math.sin(jitterAngle) * jitterDist,
          size: Math.random() * 1.8 + 0.5,
          color: Math.random() > 0.6 ? "#ffd700" : (Math.random() > 0.3 ? "#a0d8ef" : "#ffffff"),
          alpha: 0.35 + Math.random() * 0.6
        });
      }
    });
  }

  initBlackHoles() {
    this.blackHoles = [
      // 1. The Great Void Singularity (Lower Left)
      {
        relX: 0.15,
        relY: 0.76,
        horizonR: 16,
        photonR: 20,
        diskR: 56,
        tiltScaleY: 0.40,
        tiltAngle: -0.42,
        spinAngle: 0,
        spinSpeed: 0.045,
        colorCore: "#000000",
        colorDisk: "#ffb347",
        particles: []
      },
      // 2. Micro Singularity (Upper Right)
      {
        relX: 0.85,
        relY: 0.24,
        horizonR: 11,
        photonR: 14,
        diskR: 38,
        tiltScaleY: 0.44,
        tiltAngle: 0.62,
        spinAngle: 0,
        spinSpeed: 0.065,
        colorCore: "#000000",
        colorDisk: "#00e5ff",
        particles: []
      }
    ];

    // Populate accretion disk hot relativistic gas knots
    this.blackHoles.forEach((bh) => {
      bh.particles = [];
      const pCount = bh.horizonR > 14 ? 65 : 45;
      for (let i = 0; i < pCount; i++) {
        const radius = bh.photonR + Math.pow(Math.random(), 0.7) * (bh.diskR - bh.photonR);
        const angle = Math.random() * Math.PI * 2;
        // Keplerian orbital speed: v ~ 1/sqrt(r)
        const speed = (18 / Math.sqrt(radius)) * 0.05;
        bh.particles.push({
          radius,
          angle,
          speed,
          size: Math.random() * 2.2 + 0.8,
          hue: Math.random() > 0.5 ? "#fff" : bh.colorDisk
        });
      }
    });
  }

  initExoplanet() {
    this.exoplanet = {
      relX: 0.88,
      relY: 0.48,
      radius: 20,
      ringInner: 26,
      ringOuter: 46,
      ringTilt: 0.38,
      ringScaleY: 0.32,
      planetGrad: ["#2a1645", "#140a24", "#06020c"]
    };
  }

  // ─────────────────────────────────────────────────────────────
  // SHOOTING STARS & COSMIC BURSTS
  // ─────────────────────────────────────────────────────────────
  spawnShootingStar(opts = {}) {
    // Showering direction: diagonally downward from top-right to bottom-left
    const angle = opts.angle !== undefined ? opts.angle : (Math.PI * 0.72 + (Math.random() - 0.5) * 0.25);
    const speed = opts.speed || (15 + Math.random() * 11);
    const startX = opts.x !== undefined ? opts.x : (Math.random() * this.width * 1.2 - this.width * 0.1);
    const startY = opts.y !== undefined ? opts.y : (Math.random() * this.height * 0.3 - 50);

    const length = 140 + Math.random() * 120;
    const colors = [
      { core: "#ffffff", mid: "#ffd700", tail: "rgba(255, 69, 0, 0)" },
      { core: "#ffffff", mid: "#00ffff", tail: "rgba(147, 112, 219, 0)" },
      { core: "#ffffff", mid: "#ff80df", tail: "rgba(75, 0, 130, 0)" }
    ];
    const colorScheme = colors[Math.floor(Math.random() * colors.length)];

    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      width: Math.random() * 2.0 + 1.2,
      color: colorScheme,
      life: 0,
      maxLife: 45 + Math.floor(Math.random() * 30),
      sparks: []
    });
  }

  triggerCosmicBurst(x, y) {
    // 1. Gravitational Shockwave Ring
    this.gravWaves.push({
      x, y,
      radius: 6,
      maxRadius: Math.max(this.width, this.height) * 0.45,
      alpha: 1.0,
      speed: 7.5
    });

    // 2. Star Shower Cascade radiating outwards
    const meteorCount = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < meteorCount; i++) {
      const angle = (i / meteorCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const speed = 12 + Math.random() * 12;
      this.spawnShootingStar({
        x: x + Math.cos(angle) * 15,
        y: y + Math.sin(angle) * 15,
        angle: angle,
        speed: speed
      });
    }

    // 3. Radial Stardust Nova
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1.5;
      this.stardust.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1.0,
        color: Math.random() > 0.4 ? "#ffd700" : "#00ffff",
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02
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
  // UPDATE PHYSICS
  // ─────────────────────────────────────────────────────────────
  update() {
    const now = this._now();

    // Smooth cursor interpolation (lerp)
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    // A. Showering Star Spawn Scheduler
    if (now > this.nextMeteorTime) {
      this.spawnShootingStar();
      // Occasional rapid burst (Meteor Shower Storm)
      if (Math.random() > 0.65) {
        setTimeout(() => this.spawnShootingStar(), 120);
        if (Math.random() > 0.5) setTimeout(() => this.spawnShootingStar(), 260);
      }
      this.nextMeteorTime = now + (500 + Math.random() * 1100);
    }

    // B. Update Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;

      // Gravitational deflection near black holes
      this.blackHoles.forEach((bh) => {
        const bhX = bh.relX * this.width;
        const bhY = bh.relY * this.height;
        const dist = Math.hypot(bhX - s.x, bhY - s.y);
        if (dist < 180 && dist > bh.horizonR) {
          const force = (1200 / (dist * dist)) * 0.8;
          s.vx += ((bhX - s.x) / dist) * force;
          s.vy += ((bhY - s.y) / dist) * force;
        }
      });

      // Spawn spark embers along the meteor tail
      if (Math.random() > 0.45) {
        s.sparks.push({
          x: s.x + (Math.random() - 0.5) * 4,
          y: s.y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1.2 - s.vx * 0.05,
          vy: (Math.random() - 0.5) * 1.2 - s.vy * 0.05,
          alpha: 0.9,
          size: Math.random() * 1.8 + 0.6,
          color: s.color.mid
        });
      }

      // Update sparks
      for (let j = s.sparks.length - 1; j >= 0; j--) {
        const sp = s.sparks[j];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.035;
        if (sp.alpha <= 0) s.sparks.splice(j, 1);
      }

      // Cull dead meteors
      if (s.life > s.maxLife || s.x < -200 || s.x > this.width + 200 || s.y > this.height + 200) {
        this.shootingStars.splice(i, 1);
      }
    }

    // C. Update Cursor Stardust Embers
    for (let i = this.stardust.length - 1; i >= 0; i--) {
      const p = this.stardust[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.alpha -= p.decay;

      // Attract towards nearest black hole if nearby
      this.blackHoles.forEach((bh) => {
        const bhX = bh.relX * this.width;
        const bhY = bh.relY * this.height;
        const d = Math.hypot(bhX - p.x, bhY - p.y);
        if (d < 140 && d > bh.horizonR) {
          const f = (600 / (d * d)) * 0.5;
          p.vx += ((bhX - p.x) / d) * f;
          p.vy += ((bhY - p.y) / d) * f;
        }
      });

      if (p.alpha <= 0) {
        this.stardust.splice(i, 1);
      }
    }

    // D. Update Gravitational Waves
    for (let i = this.gravWaves.length - 1; i >= 0; i--) {
      const w = this.gravWaves[i];
      w.radius += w.speed;
      w.alpha -= 0.022;
      if (w.alpha <= 0 || w.radius > w.maxRadius) {
        this.gravWaves.splice(i, 1);
      }
    }

    // E. Spin Black Hole Accretion Disks
    this.blackHoles.forEach((bh) => {
      bh.spinAngle += bh.spinSpeed;
      bh.particles.forEach((p) => {
        p.angle += p.speed;
      });
    });

    // F. Spin Galaxies
    this.galaxies.forEach((g) => {
      g.rotAngle += g.spinSpeed;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER GRAPHICS
  // ─────────────────────────────────────────────────────────────
  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Base Deep Space Background
    ctx.fillStyle = "#040207";
    ctx.fillRect(0, 0, this.width, this.height);

    // Parallax offsets based on cursor
    const parallaxX = (this.mouseX - this.width / 2) * 0.04;
    const parallaxY = (this.mouseY - this.height / 2) * 0.04;

    // 2. Cosmic Nebulae Clouds
    this.drawNebulae(ctx, parallaxX, parallaxY);

    // 3. Distant Galaxies
    this.drawGalaxies(ctx, parallaxX, parallaxY);

    // 4. Ringed Exoplanet
    this.drawExoplanet(ctx, parallaxX, parallaxY);

    // 5. Twinkling Starfield
    this.drawStars(ctx, parallaxX, parallaxY);

    // 6. Black Holes with Event Horizons & Accretion Disks
    this.drawBlackHoles(ctx, parallaxX, parallaxY);

    // 7. Gravitational Wave Shockwaves
    this.drawGravWaves(ctx);

    // 8. Showering Shooting Stars & Sparks
    this.drawShootingStars(ctx);

    // 9. Mouse Stardust Wake
    this.drawStardust(ctx);
  }

  drawNebulae(ctx, px, py) {
    ctx.save();
    // A. Cyan/Teal Veil (Upper Left)
    const g1 = ctx.createRadialGradient(
      this.width * 0.22 + px * 0.5, this.height * 0.24 + py * 0.5, 30,
      this.width * 0.22 + px * 0.5, this.height * 0.24 + py * 0.5, 320
    );
    g1.addColorStop(0, "rgba(22, 100, 160, 0.16)");
    g1.addColorStop(0.5, "rgba(18, 50, 110, 0.08)");
    g1.addColorStop(1, "rgba(4, 2, 7, 0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, this.width, this.height);

    // B. Magenta/Violet Cosmic Dust (Right Mid)
    const g2 = ctx.createRadialGradient(
      this.width * 0.78 + px * 0.6, this.height * 0.65 + py * 0.6, 40,
      this.width * 0.78 + px * 0.6, this.height * 0.65 + py * 0.6, 360
    );
    g2.addColorStop(0, "rgba(142, 68, 173, 0.18)");
    g2.addColorStop(0.5, "rgba(92, 30, 107, 0.09)");
    g2.addColorStop(1, "rgba(4, 2, 7, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, this.width, this.height);

    // C. Golden Amber Stellar Hearth (Lower Left)
    const g3 = ctx.createRadialGradient(
      this.width * 0.25 + px * 0.4, this.height * 0.80 + py * 0.4, 30,
      this.width * 0.25 + px * 0.4, this.height * 0.80 + py * 0.4, 280
    );
    g3.addColorStop(0, "rgba(212, 175, 55, 0.12)");
    g3.addColorStop(0.6, "rgba(180, 100, 20, 0.05)");
    g3.addColorStop(1, "rgba(4, 2, 7, 0)");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  drawStars(ctx, px, py) {
    ctx.save();
    const time = this._now();

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const starParallaxX = px * s.depth * 1.2;
      const starParallaxY = py * s.depth * 1.2;
      const x = s.x + starParallaxX;
      const y = s.y + starParallaxY;

      // Twinkle calculation
      const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
      const alpha = Math.max(0.25, Math.min(1.0, 0.65 + twinkle * 0.35));
      const radius = s.baseR * (0.85 + twinkle * 0.15);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Diffraction cross-spikes for bright stars
      if (s.hasSpikes && alpha > 0.75) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = (alpha - 0.75) * 1.5;
        const spikeLen = radius * 3.5;
        ctx.beginPath();
        ctx.moveTo(x - spikeLen, y);
        ctx.lineTo(x + spikeLen, y);
        ctx.moveTo(x, y - spikeLen);
        ctx.lineTo(x, y + spikeLen);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawGalaxies(ctx, px, py) {
    this.galaxies.forEach((g) => {
      ctx.save();
      const gx = g.relX * this.width + px * 0.5;
      const gy = g.relY * this.height + py * 0.5;

      ctx.translate(gx, gy);
      ctx.rotate(g.rotAngle);
      ctx.scale(1.0, g.tiltScaleY);

      // Core Haze Glow
      const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, g.coreRadius * 2.8);
      coreGrad.addColorStop(0, g.coreColors[0]);
      coreGrad.addColorStop(0.25, g.coreColors[1]);
      coreGrad.addColorStop(0.65, g.coreColors[2]);
      coreGrad.addColorStop(1, "transparent");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, g.coreRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Spiral Arm Stars
      g.particles.forEach((p) => {
        const curAngle = p.angle + g.rotAngle;
        const x = Math.cos(curAngle) * p.relDist + p.jitterX;
        const y = Math.sin(curAngle) * p.relDist + p.jitterY;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });
  }

  drawBlackHoles(ctx, px, py) {
    this.blackHoles.forEach((bh) => {
      ctx.save();
      const bhX = bh.relX * this.width + px * 0.8;
      const bhY = bh.relY * this.height + py * 0.8;

      ctx.translate(bhX, bhY);
      ctx.rotate(bh.tiltAngle);
      ctx.scale(1.0, bh.tiltScaleY);

      // 1. Accretion Disk Outer Glow
      const diskGrad = ctx.createRadialGradient(0, 0, bh.photonR, 0, 0, bh.diskR * 1.5);
      diskGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      diskGrad.addColorStop(0.2, bh.colorDisk);
      diskGrad.addColorStop(0.6, "rgba(230, 92, 0, 0.45)");
      diskGrad.addColorStop(0.85, "rgba(128, 0, 128, 0.2)");
      diskGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bh.diskR * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Relativistic Orbiting Accretion Matter
      bh.particles.forEach((p) => {
        const x = Math.cos(p.angle) * p.radius;
        const y = Math.sin(p.angle) * p.radius;
        // Doppler beaming: approaching side is brighter
        const doppler = 0.5 + 0.5 * Math.sin(p.angle);
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = doppler * 0.9;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.8 + doppler * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Einstein Photon Sphere Ring (Intense Glowing Rim)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = bh.colorDisk;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, bh.photonR, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Jet-Black Event Horizon (Absolute Singularity)
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(0, 0, bh.horizonR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawExoplanet(ctx, px, py) {
    if (!this.exoplanet) return;
    const ep = this.exoplanet;
    ctx.save();
    const ex = ep.relX * this.width + px * 0.35;
    const ey = ep.relY * this.height + py * 0.35;

    ctx.translate(ex, ey);

    // 1. Back Half of Rings
    ctx.save();
    ctx.rotate(ep.ringTilt);
    ctx.scale(1.0, ep.ringScaleY);
    ctx.beginPath();
    ctx.arc(0, 0, ep.ringOuter, Math.PI, Math.PI * 2);
    ctx.lineWidth = ep.ringOuter - ep.ringInner;
    ctx.strokeStyle = "rgba(168, 140, 210, 0.28)";
    ctx.stroke();
    ctx.restore();

    // 2. Planet Sphere with 3D Shadow
    const sphereGrad = ctx.createRadialGradient(
      -ep.radius * 0.4, -ep.radius * 0.4, ep.radius * 0.2,
      0, 0, ep.radius
    );
    sphereGrad.addColorStop(0, ep.planetGrad[0]);
    sphereGrad.addColorStop(0.5, ep.planetGrad[1]);
    sphereGrad.addColorStop(1, ep.planetGrad[2]);

    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(0, 0, ep.radius, 0, Math.PI * 2);
    ctx.fill();

    // Atmospheric rim glow
    ctx.strokeStyle = "rgba(100, 180, 255, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, ep.radius, -Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();

    // 3. Front Half of Rings
    ctx.save();
    ctx.rotate(ep.ringTilt);
    ctx.scale(1.0, ep.ringScaleY);
    ctx.beginPath();
    ctx.arc(0, 0, ep.ringOuter, 0, Math.PI);
    ctx.lineWidth = ep.ringOuter - ep.ringInner;
    ctx.strokeStyle = "rgba(198, 170, 230, 0.45)";
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  drawShootingStars(ctx) {
    ctx.save();
    this.shootingStars.forEach((s) => {
      // Draw tail gradient
      const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.length;
      const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.length;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, s.color.tail);
      grad.addColorStop(0.7, s.color.mid);
      grad.addColorStop(1, s.color.core);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.stroke();

      // Bright incandescence at head
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.width * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Draw sparks
      s.sparks.forEach((sp) => {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = Math.max(0, sp.alpha);
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
      ctx.globalAlpha = Math.max(0, p.alpha);
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
      ctx.strokeStyle = `rgba(212, 175, 55, ${Math.max(0, w.alpha * 0.65)})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w.x, w.y, Math.max(0, w.radius - 12), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160, 230, 255, ${Math.max(0, w.alpha * 0.4)})`;
      ctx.lineWidth = 1.2;
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
