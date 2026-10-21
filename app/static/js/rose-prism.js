/**
 * Compline — Gothic Rose Window Prismatic Stained-Glass Ambient Lighting Engine
 * (Lux Lucis Cathedralis)
 *
 * Implements real-time volumetric god-rays, chromatic caustics, and stained-glass
 * light refractions projected downward from the Cathedral's Rose Window.
 */

class RoseWindowPrism {
  constructor(canvasId = "rosePrismCanvas") {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.ctx = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    this.isActive = true;
    this.intensity = 1.0; // Master intensity [0.0 - 1.0]
    this.currentPaletteIndex = 0;

    // Cathedral Stained-Glass Palettes (RGB triplets)
    this.palettes = [
      {
        id: "notre_dame",
        name: "Notre-Dame (Ruby & Cobalt)",
        colors: [
          [235, 35, 75],   // Sacred Ruby Crimson
          [35, 115, 235],  // Chartres Cobalt Blue
          [255, 195, 45],  // Altar Gold Amber
          [155, 55, 240],  // Royal Amethyst Violet
          [20, 205, 140]   // Emerald Glass
        ]
      },
      {
        id: "sainte_chapelle",
        name: "Sainte-Chapelle (Amethyst & Carmine)",
        colors: [
          [165, 60, 255],  // Royal Violet
          [240, 30, 80],   // Carmine Rose
          [255, 205, 50],  // Radiant Gold
          [210, 145, 255], // Pale Amethyst
          [255, 80, 110]   // Ruby Flare
        ]
      },
      {
        id: "chartres",
        name: "Chartres (Sapphire & Azure)",
        colors: [
          [35, 90, 245],   // Deep Cobalt Sapphire
          [60, 200, 255],  // Celestial Azure
          [240, 245, 255], // Moon Silver
          [110, 115, 255], // Twilight Indigo
          [20, 180, 250]   // Cyan Glass
        ]
      },
      {
        id: "alchemical",
        name: "Alchemical (Emerald & Citrine)",
        colors: [
          [20, 205, 145],  // Emerald Hermes
          [250, 195, 10],  // Sol Citrine
          [235, 45, 45],   // Philosophic Ruby
          [155, 105, 255], // Quintessence Violet
          [55, 230, 210]   // Mystic Aquamarine
        ]
      }
    ];

    // Light Source Anchor
    this.sourceX = this.width / 2;
    this.sourceY = Math.max(90, this.height * 0.16);

    // Parallax Tilt
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.targetTiltX = 0;
    this.targetTiltY = 0;
    this.tiltX = 0;
    this.tiltY = 0;

    // Volumetric God-Rays
    this.rays = [];
    this.numRays = 16;

    // Floating Prismatic Caustic Particles
    this.particles = [];
    this.numParticles = 36;

    // Dynamic Prismatic Flare / Burst Wave
    this.bursts = [];

    this.animFrameId = null;

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.ctx = this.canvas.getContext("2d");
    this.resize();

    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => this.onMouseMove(e), { passive: true });

    // Generate static ray configurations with individual phase offsets
    this.initRays();

    // Generate caustic dust motes
    this.initParticles();

    // Start render loop
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Re-locate Rose Window element on page if present
    this.updateSourcePosition();
  }

  updateSourcePosition() {
    const roseWheel = document.getElementById("roseWheel");
    if (roseWheel) {
      const rect = roseWheel.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.sourceX = rect.left + rect.width / 2;
        this.sourceY = rect.top + rect.height / 2;
        this.applyWheelGlow();
        return;
      }
    }
    this.sourceX = this.width / 2;
    this.sourceY = Math.max(90, this.height * 0.16);
    this.applyWheelGlow();
  }

  applyWheelGlow() {
    const roseWheel = document.getElementById("roseWheel");
    if (!roseWheel) return;
    const current = this.palettes[this.currentPaletteIndex];
    const c1 = current.colors[0];
    const c2 = current.colors[1];
    roseWheel.style.filter = `drop-shadow(0 0 28px rgba(${c1.join(",")}, 0.85)) drop-shadow(0 0 55px rgba(${c2.join(",")}, 0.6))`;
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    // Normalized [-1, 1] offset relative to source
    this.targetTiltX = (this.mouseX - this.sourceX) / (this.width / 2);
    this.targetTiltY = (this.mouseY - this.sourceY) / (this.height);
  }

  initRays() {
    this.rays = [];
    const spread = Math.PI * 0.88; // Downward spread angle (~160 degrees)
    const baseAngle = Math.PI / 2; // Straight down

    for (let i = 0; i < this.numRays; i++) {
      const angleFraction = (i / (this.numRays - 1)) - 0.5; // [-0.5, 0.5]
      const angle = baseAngle + angleFraction * spread;
      const palette = this.palettes[this.currentPaletteIndex].colors;
      const color = palette[i % palette.length];

      this.rays.push({
        baseAngle,
        spreadOffset: angleFraction * spread,
        beamWidth: 0.09 + Math.random() * 0.10, // Radians
        length: Math.max(this.width, this.height) * (1.1 + Math.random() * 0.45),
        color,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.45,
        alphaMax: 0.35 + Math.random() * 0.25
      });
    }
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      const palette = this.palettes[this.currentPaletteIndex].colors;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: 0.35 + Math.random() * 0.75,
        radius: 3.5 + Math.random() * 6.5,
        color: palette[i % palette.length],
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.8 + Math.random() * 1.4,
        baseAlpha: 0.5 + Math.random() * 0.4
      });
    }
  }

  cyclePalette() {
    this.currentPaletteIndex = (this.currentPaletteIndex + 1) % this.palettes.length;
    const current = this.palettes[this.currentPaletteIndex];

    // Re-color rays & particles to match new cathedral palette
    this.rays.forEach((ray, i) => {
      ray.color = current.colors[i % current.colors.length];
    });
    this.particles.forEach((p, i) => {
      p.color = current.colors[i % current.colors.length];
    });

    this.applyWheelGlow();
    this.triggerBurst(this.sourceX, this.sourceY);
    return current;
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.canvas) {
      this.canvas.classList.toggle("hidden", !this.isActive);
    }
    return this.isActive;
  }

  triggerBurst(x = null, y = null) {
    const bx = x !== null ? x : this.sourceX;
    const by = y !== null ? y : this.sourceY;
    const palette = this.palettes[this.currentPaletteIndex].colors;

    this.bursts.push({
      x: bx,
      y: by,
      radius: 20,
      maxRadius: Math.max(this.width, this.height) * 0.95,
      speed: 16 + Math.random() * 4,
      alpha: 0.75,
      color: palette[Math.floor(Math.random() * palette.length)],
      subColor: palette[(Math.floor(Math.random() * palette.length) + 1) % palette.length]
    });
  }

  render() {
    if (!this.ctx) return;

    // Smooth tilt lerp
    this.tiltX += (this.targetTiltX - this.tiltX) * 0.04;
    this.tiltY += (this.targetTiltY - this.tiltY) * 0.04;

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Clear frame
    ctx.clearRect(0, 0, this.width, this.height);

    if (!this.isActive || this.intensity <= 0) {
      ctx.restore();
      this.animFrameId = requestAnimationFrame(() => this.render());
      return;
    }

    const time = performance.now() * 0.001;

    // Update source position occasionally to track scrolling or layout
    if (Math.random() < 0.02) {
      this.updateSourcePosition();
    }

    // Blend mode for volumetric cathedral lighting
    ctx.globalCompositeOperation = "screen";

    const sx = this.sourceX;
    const sy = this.sourceY;

    // ─────────────────────────────────────────────────────────────
    // 0. Ambient Cathedral Stained-Glass Nave Wash
    // ─────────────────────────────────────────────────────────────
    const primaryColor = this.palettes[this.currentPaletteIndex].colors[0];
    const secondaryColor = this.palettes[this.currentPaletteIndex].colors[1];
    const tertiaryColor = this.palettes[this.currentPaletteIndex].colors[2];

    const ambGrad = ctx.createRadialGradient(sx, sy + 250, 60, sx, sy + 350, Math.max(this.width, this.height) * 0.85);
    ambGrad.addColorStop(0, `rgba(${primaryColor.join(",")}, ${0.18 * this.intensity})`);
    ambGrad.addColorStop(0.35, `rgba(${secondaryColor.join(",")}, ${0.10 * this.intensity})`);
    ambGrad.addColorStop(0.7, `rgba(${tertiaryColor.join(",")}, ${0.05 * this.intensity})`);
    ambGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = ambGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // ─────────────────────────────────────────────────────────────
    // 1. Central Rose Window Radial Chromatic Halo
    // ─────────────────────────────────────────────────────────────
    const haloRadius = 380 + Math.sin(time * 0.8) * 35;
    const haloGrad = ctx.createRadialGradient(sx, sy, 20, sx, sy, haloRadius);
    haloGrad.addColorStop(0, `rgba(${primaryColor.join(",")}, ${0.65 * this.intensity})`);
    haloGrad.addColorStop(0.25, `rgba(${secondaryColor.join(",")}, ${0.35 * this.intensity})`);
    haloGrad.addColorStop(0.6, `rgba(${tertiaryColor.join(",")}, ${0.15 * this.intensity})`);
    haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // ─────────────────────────────────────────────────────────────
    // 2. Volumetric Stained-Glass God-Rays
    // ─────────────────────────────────────────────────────────────
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];

      // Oscillate ray angle and breathing alpha
      const sway = Math.sin(time * ray.speed + ray.phase) * 0.08;
      const angle = ray.baseAngle + ray.spreadOffset + sway + (this.tiltX * 0.15);
      const alphaBreath = (0.65 + 0.35 * Math.sin(time * ray.speed * 1.5 + ray.phase));
      const currentAlpha = ray.alphaMax * alphaBreath * this.intensity;

      const halfBeam = ray.beamWidth / 2;
      const a1 = angle - halfBeam;
      const a2 = angle + halfBeam;

      const len = ray.length;
      const x1 = sx + Math.cos(a1) * len;
      const y1 = sy + Math.sin(a1) * len;
      const x2 = sx + Math.cos(a2) * len;
      const y2 = sy + Math.sin(a2) * len;

      const rayGrad = ctx.createRadialGradient(sx, sy, 30, sx, sy, len);
      const rgb = ray.color;
      rayGrad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${currentAlpha * 2.2})`);
      rayGrad.addColorStop(0.25, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${currentAlpha * 1.5})`);
      rayGrad.addColorStop(0.65, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${currentAlpha * 0.6})`);
      rayGrad.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Dynamic Expanding Chromatic Shockwaves (Bursts)
    // ─────────────────────────────────────────────────────────────
    for (let b = this.bursts.length - 1; b >= 0; b--) {
      const burst = this.bursts[b];
      burst.radius += burst.speed;
      burst.alpha *= 0.955;

      if (burst.alpha < 0.01 || burst.radius > burst.maxRadius) {
        this.bursts.splice(b, 1);
        continue;
      }

      ctx.save();
      ctx.lineWidth = 4 + (1 - burst.alpha) * 8;
      const burstGrad = ctx.createRadialGradient(burst.x, burst.y, Math.max(0, burst.radius - 30), burst.x, burst.y, burst.radius + 30);
      burstGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      burstGrad.addColorStop(0.5, `rgba(${burst.color.join(",")}, ${burst.alpha * 0.65})`);
      burstGrad.addColorStop(0.8, `rgba(${burst.subColor.join(",")}, ${burst.alpha * 0.45})`);
      burstGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.strokeStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Floating Chromatic Caustic Particles (Stained-Glass Dust)
    // ─────────────────────────────────────────────────────────────
    for (let p = 0; p < this.particles.length; p++) {
      const pt = this.particles[p];
      pt.y += pt.vy;
      pt.x += pt.vx + Math.sin(time + pt.phase) * 0.3;

      // Wrap around bounds
      if (pt.y > this.height + 20) {
        pt.y = -20;
        pt.x = Math.random() * this.width;
      }
      if (pt.x < -20) pt.x = this.width + 20;
      if (pt.x > this.width + 20) pt.x = -20;

      const pAlpha = (pt.baseAlpha + Math.sin(time * pt.pulseSpeed + pt.phase) * 0.2) * this.intensity;
      if (pAlpha <= 0) continue;

      const rgb = pt.color;
      const pGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.radius * 2);
      pGrad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${pAlpha * 1.2})`);
      pGrad.addColorStop(0.4, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${pAlpha * 0.6})`);
      pGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    this.animFrameId = requestAnimationFrame(() => this.render());
  }

  start() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(() => this.render());
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.rosePrism = new RoseWindowPrism("rosePrismCanvas");
});
