/**
 * 3D Interactive Celestial Stellar Map Engine (Web Audio & Canvas 2D)
 * Classical Gothic Astrolabe & Spherical Starfield
 *
 * Features:
 *  - 3D Cartesian-to-Spherical celestial projection (Euler pitch & yaw with damping)
 *  - Classical historical constellations (Ursa Major, Cygnus/Northern Cross, Orion, Cassiopeia, Lyra, Taurus)
 *  - 3D Armillary Astrolabe Coordinate Rings (Celestial Equator, Ecliptic, Prime Meridian, Arctic Circle)
 *  - Full mouse & touch orbit, velocity inertia, and subtle diurnal auto-drift
 *  - Dynamic cursor constellation weaving & gravitational stardust pulse
 *  - Seamless persistence across starting page (intro overlay) and landing page
 *  - Butter-smooth 60/120fps with capped DPR and Battery Visibility API
 */

class StellarMap {
  constructor(canvasId = "stellarMapCanvas") {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn("StellarMap: canvas element not found, id:", canvasId);
      return;
    }

    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    // 3D Camera & Rotation state
    this.rotX = 0.22;       // Pitch (vertical tilt)
    this.rotY = -0.45;      // Yaw (horizontal azimuth)
    this.targetRotX = 0.22;
    this.targetRotY = -0.45;
    this.focalLength = 520; // Perspective depth
    this.targetFocal = 520;
    this.autoDrift = true;
    this.driftSpeed = 0.00035;

    // Mouse / Pointer state
    this.pointerX = this.width / 2;
    this.pointerY = this.height / 2;
    this.lastPointerX = this.pointerX;
    this.lastPointerY = this.pointerY;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.hoveredStar = null;

    // Display toggles
    this.showConstellations = true;
    this.showAstrolabeRings = true;
    this.showStarNames = true;

    // Effects & Pulses
    this.pulses = [];
    this.bloomAlpha = 0;
    this.animFrameId = null;
    this.isPaused = false;

    // Initialize celestial data
    this.stars = [];
    this.constellations = [];
    this.astrolabeRings = [];

    this.initData();
    this.resize();
    this.bindEvents();
    this.start();
  }

  // ─────────────────────────────────────────────────────────────
  // 1. CELESTIAL DATA & HISTORICAL CONSTELLATIONS
  // ─────────────────────────────────────────────────────────────
  initData() {
    // A. Major Classical Astrolabe Stars (Gothic Historical Coordinates)
    // Angles in spherical coordinates: ra (0 to 2pi), dec (-pi/2 to pi/2)
    const majorStarsData = [
      // Ursa Major & North
      { name: "Polaris", constell: "Ursa Minor", ra: 0.66, dec: 1.55, mag: 1.98, color: "#fff0a8", label: "Stella Maris" },
      { name: "Dubhe", constell: "Ursa Major", ra: 2.89, dec: 1.08, mag: 1.8, color: "#ffd27a" },
      { name: "Merak", constell: "Ursa Major", ra: 2.87, dec: 0.98, mag: 2.3, color: "#eef5ff" },
      { name: "Phecda", constell: "Ursa Major", ra: 3.11, dec: 0.94, mag: 2.4, color: "#eef5ff" },
      { name: "Megrez", constell: "Ursa Major", ra: 3.19, dec: 0.99, mag: 3.3, color: "#d8e8ff" },
      { name: "Alioth", constell: "Ursa Major", ra: 3.38, dec: 0.97, mag: 1.7, color: "#f0f6ff" },
      { name: "Mizar", constell: "Ursa Major", ra: 3.51, dec: 0.95, mag: 2.2, color: "#d2ecff" },
      { name: "Alkaid", constell: "Ursa Major", ra: 3.61, dec: 0.86, mag: 1.8, color: "#b8dfff" },

      // Cygnus (The Northern Cross)
      { name: "Deneb", constell: "Cygnus", ra: 5.41, dec: 0.79, mag: 1.25, color: "#ffffff", label: "Northern Cross" },
      { name: "Sadr", constell: "Cygnus", ra: 5.34, dec: 0.70, mag: 2.2, color: "#fff4d0" },
      { name: "Gienah", constell: "Cygnus", ra: 5.44, dec: 0.59, mag: 2.4, color: "#b8dfff" },
      { name: "Albireo", constell: "Cygnus", ra: 5.11, dec: 0.49, mag: 3.0, color: "#ffd066", label: "Golden Topaz" },
      { name: "Fawaris", constell: "Cygnus", ra: 5.17, dec: 0.78, mag: 2.8, color: "#c4e2ff" },

      // Lyra (Monastic Harp)
      { name: "Vega", constell: "Lyra", ra: 4.87, dec: 0.67, mag: 0.03, color: "#c8e8ff", label: "Harp of David" },
      { name: "Sheliak", constell: "Lyra", ra: 4.97, dec: 0.58, mag: 3.4, color: "#f5f0ff" },
      { name: "Sulafat", constell: "Lyra", ra: 4.97, dec: 0.57, mag: 3.2, color: "#bce4ff" },

      // Aquila (The Eagle)
      { name: "Altair", constell: "Aquila", ra: 5.19, dec: 0.15, mag: 0.77, color: "#f6f8ff", label: "Flying Eagle" },
      { name: "Tarazed", constell: "Aquila", ra: 5.16, dec: 0.18, mag: 2.7, color: "#ffb366" },
      { name: "Alshain", constell: "Aquila", ra: 5.21, dec: 0.11, mag: 3.7, color: "#ffe6b8" },

      // Orion (The Celestial Hunter)
      { name: "Betelgeuse", constell: "Orion", ra: 1.55, dec: 0.13, mag: 0.5, color: "#ff7340", label: "Red Supergiant" },
      { name: "Rigel", constell: "Orion", ra: 1.37, dec: -0.14, mag: 0.13, color: "#a8e0ff", label: "Diamond Foot" },
      { name: "Bellatrix", constell: "Orion", ra: 1.42, dec: 0.11, mag: 1.6, color: "#c0e5ff" },
      { name: "Saiph", constell: "Orion", ra: 1.52, dec: -0.17, mag: 2.0, color: "#b0dbff" },
      { name: "Alnitak", constell: "Orion", ra: 1.48, dec: -0.03, mag: 1.7, color: "#bce4ff" },
      { name: "Alnilam", constell: "Orion", ra: 1.47, dec: -0.02, mag: 1.6, color: "#bce4ff" },
      { name: "Mintaka", constell: "Orion", ra: 1.45, dec: -0.01, mag: 2.2, color: "#bce4ff" },

      // Cassiopeia (The Heavenly Throne)
      { name: "Schedar", constell: "Cassiopeia", ra: 0.17, dec: 0.98, mag: 2.2, color: "#ffc266" },
      { name: "Caph", constell: "Cassiopeia", ra: 0.04, dec: 1.03, mag: 2.2, color: "#f8f0ff" },
      { name: "Gamma Cas", constell: "Cassiopeia", ra: 0.24, dec: 1.06, mag: 2.1, color: "#b0d9ff" },
      { name: "Ruchbah", constell: "Cassiopeia", ra: 0.35, dec: 1.05, mag: 2.6, color: "#eef5ff" },
      { name: "Segin", constell: "Cassiopeia", ra: 0.46, dec: 1.11, mag: 3.3, color: "#b5dcff" },

      // Taurus & Pleiades
      { name: "Aldebaran", constell: "Taurus", ra: 1.19, dec: 0.28, mag: 0.85, color: "#ff8c40", label: "Eye of the Bull" },
      { name: "Elnath", constell: "Taurus", ra: 1.42, dec: 0.50, mag: 1.6, color: "#c4e5ff" },
      { name: "Alcyone", constell: "Pleiades", ra: 0.99, dec: 0.42, mag: 2.8, color: "#a5d8ff", label: "Seven Sisters" },

      // Bright Winter & Spring Landmarks
      { name: "Sirius", constell: "Canis Major", ra: 1.77, dec: -0.29, mag: -1.46, color: "#e0f6ff", label: "The Scorcher" },
      { name: "Procyon", constell: "Canis Minor", ra: 2.01, dec: 0.09, mag: 0.38, color: "#fff0c0" },
      { name: "Capella", constell: "Auriga", ra: 1.39, dec: 0.80, mag: 0.08, color: "#ffe899", label: "The Little Goat" },
      { name: "Arcturus", constell: "Boötes", ra: 3.73, dec: 0.33, mag: -0.05, color: "#ffaa4d", label: "Guardian of the Bear" },
      { name: "Spica", constell: "Virgo", ra: 3.49, dec: -0.19, mag: 0.98, color: "#b8e2ff", label: "Ear of Wheat" },
      { name: "Antares", constell: "Scorpius", ra: 4.29, dec: -0.46, mag: 1.06, color: "#ff5030", label: "Cor Scorpii" }
    ];

    const R = 880; // Celestial Sphere Radius

    this.majorStarIndexMap = {};
    majorStarsData.forEach((d) => {
      const cosDec = Math.cos(d.dec);
      const x = R * cosDec * Math.cos(d.ra);
      const y = R * Math.sin(d.dec);
      const z = R * cosDec * Math.sin(d.ra);

      const starObj = {
        name: d.name,
        constell: d.constell,
        label: d.label || null,
        ra: d.ra,
        dec: d.dec,
        x, y, z,
        baseR: Math.max(1.4, (3.8 - d.mag * 0.7)),
        mag: d.mag,
        color: d.color,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        isMajor: true,
        // Projected runtime values
        px: 0, py: 0, pz: 0, scale: 0, visible: false
      };

      this.majorStarIndexMap[d.name] = this.stars.length;
      this.stars.push(starObj);
    });

    // B. Constellation Vector Connections
    this.constellationLinks = [
      // Ursa Major (The Big Dipper)
      ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"],
      ["Megrez", "Dubhe"], ["Megrez", "Alioth"], ["Alioth", "Mizar"], ["Mizar", "Alkaid"],
      // Pointer from Merak/Dubhe to Polaris
      ["Dubhe", "Polaris"],

      // Cygnus (Northern Cross)
      ["Deneb", "Sadr"], ["Sadr", "Albireo"], ["Gienah", "Sadr"], ["Sadr", "Fawaris"],

      // Lyra (Harp)
      ["Vega", "Sheliak"], ["Sheliak", "Sulafat"], ["Sulafat", "Vega"],

      // Summer Triangle (Deneb - Vega - Altair)
      ["Deneb", "Vega"], ["Vega", "Altair"], ["Altair", "Tarazed"], ["Altair", "Alshain"],

      // Orion
      ["Betelgeuse", "Bellatrix"], ["Bellatrix", "Rigel"], ["Rigel", "Saiph"], ["Saiph", "Betelgeuse"],
      ["Alnitak", "Alnilam"], ["Alnilam", "Mintaka"], ["Betelgeuse", "Alnitak"], ["Bellatrix", "Mintaka"],

      // Cassiopeia (W)
      ["Caph", "Schedar"], ["Schedar", "Gamma Cas"], ["Gamma Cas", "Ruchbah"], ["Ruchbah", "Segin"],

      // Taurus
      ["Aldebaran", "Elnath"], ["Aldebaran", "Alcyone"],

      // Winter Triangle
      ["Betelgeuse", "Sirius"], ["Sirius", "Procyon"], ["Procyon", "Betelgeuse"]
    ];

    // C. Deep Cosmic Background Starfield (Procedural 3D Sphere Distribution)
    const isMobile = this.width < 768;
    const backgroundCount = isMobile ? 160 : 280;
    const colors = ["#ffffff", "#ffea99", "#d4af37", "#a0e2ff", "#caa8ff", "#ffe0c0"];

    for (let i = 0; i < backgroundCount; i++) {
      // Golden spiral distribution for uniform 3D sphere packing
      const phi = Math.acos(1 - 2 * (i + 0.5) / backgroundCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const radius = R * (0.85 + Math.random() * 0.4);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const mag = 2.5 + Math.random() * 3.5;
      const baseR = 0.6 + Math.random() * 1.3;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.stars.push({
        name: null,
        x, y, z,
        baseR,
        mag,
        color,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.04,
        isMajor: false,
        px: 0, py: 0, pz: 0, scale: 0, visible: false
      });
    }

    // D. 3D Armillary Astrolabe Coordinate Rings
    this.astrolabeRings = [
      // 1. Celestial Equator Ring (Dec = 0)
      this.generateRingPoints(R * 0.98, 0, 0, 0, "#d4af37", 0.28, "Equator"),
      // 2. Ecliptic Ring (Tilted 23.4 degrees)
      this.generateRingPoints(R * 0.98, 0.409, 0, 0, "#6bb3ff", 0.22, "Ecliptic"),
      // 3. Prime Meridian Ring (RA = 0)
      this.generateRingPoints(R * 0.98, 0, Math.PI / 2, 0, "#a8842c", 0.18, "Meridian"),
      // 4. Arctic Circle Ring (Dec = +66.5 deg)
      this.generateRingPoints(R * 0.98 * Math.cos(1.16), 0, 0, R * 0.98 * Math.sin(1.16), "#ffd700", 0.20, "Arctic Circle")
    ];
  }

  generateRingPoints(radius, tiltX, tiltY, offsetY, strokeColor, alpha, label) {
    const segments = 48;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      let x = radius * Math.cos(theta);
      let y = offsetY;
      let z = radius * Math.sin(theta);

      // Apply initial tilt
      if (tiltX !== 0) {
        const cosT = Math.cos(tiltX), sinT = Math.sin(tiltX);
        const yNew = y * cosT - z * sinT;
        const zNew = y * sinT + z * cosT;
        y = yNew; z = zNew;
      }
      if (tiltY !== 0) {
        const cosT = Math.cos(tiltY), sinT = Math.sin(tiltY);
        const xNew = x * cosT + z * sinT;
        const zNew = -x * sinT + z * cosT;
        x = xNew; z = zNew;
      }

      points.push({ x, y, z, isTick: i % 4 === 0 });
    }
    return { points, strokeColor, alpha, label };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RESIZING & HIGH-DPI SETUP
  // ─────────────────────────────────────────────────────────────
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Adjust focal length based on viewport size
    const minDim = Math.min(this.width, this.height);
    this.targetFocal = Math.max(380, Math.min(680, minDim * 0.7));
    this.focalLength = this.targetFocal;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. INTERACTIVE EVENT BINDINGS
  // ─────────────────────────────────────────────────────────────
  bindEvents() {
    // Window Resize with debouncing
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resize(), 120);
    });

    // Visibility API: pause rendering when tab is hidden to save GPU/battery
    document.addEventListener("visibilitychange", () => {
      this.isPaused = document.hidden;
      if (!this.isPaused && !this.animFrameId) {
        this.start();
      }
    });

    // Universal Airtight Text Selection Locker
    const isTextInput = (el) => {
      if (!el) return false;
      const tag = (el.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || el.isContentEditable;
    };

    // 1. Prevent selectstart everywhere except text inputs (capture phase)
    document.addEventListener("selectstart", (e) => {
      if (!isTextInput(e.target)) {
        e.preventDefault();
        if (window.getSelection) window.getSelection().removeAllRanges();
        return false;
      }
    }, true);

    // 2. Prevent dragstart text dragging everywhere except inputs
    document.addEventListener("dragstart", (e) => {
      if (!isTextInput(e.target)) {
        e.preventDefault();
        return false;
      }
    }, true);

    // 3. Selection Cleaner: Immediately wipe any non-input selection range
    document.addEventListener("selectionchange", () => {
      if (!isTextInput(document.activeElement)) {
        const sel = window.getSelection ? window.getSelection() : null;
        if (sel && !sel.isCollapsed) {
          sel.removeAllRanges();
        }
      }
    });

    // 4. Prevent double-click and multi-click text selection
    window.addEventListener("mousedown", (e) => {
      if (!isTextInput(e.target)) {
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
        if (e.detail > 1) {
          e.preventDefault();
        }
      }
    }, true);

    window.addEventListener("dblclick", (e) => {
      if (!isTextInput(e.target)) {
        e.preventDefault();
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
      }
    }, true);

    // Window-level Mouse Movement (tracks cursor everywhere on page)
    window.addEventListener("pointermove", (e) => {
      this.pointerX = e.clientX;
      this.pointerY = e.clientY;

      if (this.isDragging) {
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
        const deltaX = e.clientX - this.lastPointerX;
        const deltaY = e.clientY - this.lastPointerY;

        this.targetRotY += deltaX * 0.0035;
        this.targetRotX += deltaY * 0.0035;

        // Clamp pitch to avoid gimbal flip
        this.targetRotX = Math.max(-1.45, Math.min(1.45, this.targetRotX));
      }

      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    }, { passive: true });

    // Drag start on document background, cards, or parchment
    window.addEventListener("pointerdown", (e) => {
      const isInteractive = (el) => {
        if (!el) return false;
        const tag = (el.tagName || "").toLowerCase();
        return ["button", "input", "select", "a", "textarea", "label"].includes(tag) ||
               el.closest("button") || el.closest("a") || el.closest("input") ||
               el.closest(".gothic-modal-card") || el.closest(".track-stepper-btn") ||
               el.closest(".repertoire-card") || el.closest("#turntablePlatter") ||
               el.closest("#toneArmAssembly") || el.closest("#btnPinToggle") ||
               el.closest("#candleShrine") || el.closest(".rune-pill");
      };

      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }

      // If clicking a genuine interactive control or modal, let it handle the event
      if (isInteractive(e.target)) {
        return;
      }

      this.isDragging = true;
      document.body.classList.add("is-orbiting");
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      if (this.canvas) this.canvas.style.cursor = "grabbing";
    });

    window.addEventListener("pointerup", (e) => {
      if (this.isDragging) {
        const dist = Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY);
        if (dist < 6) {
          // It was a click! Only trigger gravitational pulse if on background
          if (!e.target.closest(".tome-card") &&
              !e.target.closest(".reliquary-card") &&
              !e.target.closest(".cathedral-header")) {
            this.triggerGravitationalPulse(e.clientX, e.clientY);
          }
        }
      }
      this.isDragging = false;
      document.body.classList.remove("is-orbiting");
      if (this.canvas) this.canvas.style.cursor = "grab";
    });

    window.addEventListener("pointercancel", () => {
      this.isDragging = false;
      document.body.classList.remove("is-orbiting");
      if (this.canvas) this.canvas.style.cursor = "grab";
    });

    // Mouse Wheel 3D Zoom (Smooth Camera Distance)
    window.addEventListener("wheel", (e) => {
      // Only zoom if pointer is on background or overlay (don't interfere with story scrolling)
      const target = e.target;
      if (target === this.canvas || target.id === "introOverlay" ||
          target.classList.contains("cathedral-container") || target.tagName.toLowerCase() === "body") {
        this.targetFocal = Math.max(300, Math.min(950, this.targetFocal - e.deltaY * 0.45));
      }
    }, { passive: true });

    // Mobile Orientation Gyroscope (if available & permitted)
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma !== null && e.beta !== null && !this.isDragging) {
          const tiltY = (e.gamma / 90) * 0.25;
          const tiltX = ((e.beta - 45) / 90) * 0.25;
          this.targetRotY += tiltY * 0.01;
          this.targetRotX = Math.max(-1.4, Math.min(1.4, this.targetRotX + tiltX * 0.01));
        }
      }, { passive: true });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. INTERACTION HELPERS
  // ─────────────────────────────────────────────────────────────
  triggerGravitationalPulse(x, y) {
    this.pulses.push({
      x, y,
      radius: 0,
      maxRadius: 280,
      strength: 1.0,
      color: "#ffd56b"
    });
  }

  triggerCelestialBloom() {
    this.bloomAlpha = 1.0;
  }

  resetToPolaris() {
    this.targetRotX = 0.22;
    this.targetRotY = -0.45;
    this.targetFocal = Math.max(380, Math.min(680, Math.min(this.width, this.height) * 0.7));
  }

  toggleConstellations() {
    this.showConstellations = !this.showConstellations;
    return this.showConstellations;
  }

  toggleAstrolabeRings() {
    this.showAstrolabeRings = !this.showAstrolabeRings;
    return this.showAstrolabeRings;
  }

  toggleAutoDrift() {
    this.autoDrift = !this.autoDrift;
    return this.autoDrift;
  }

  // ─────────────────────────────────────────────────────────────
  // 5. 3D MATH & PROJECTION PIPELINE
  // ─────────────────────────────────────────────────────────────
  project(x, y, z, centerX, centerY, cosX, sinX, cosY, sinY) {
    // Yaw rotation around Y axis
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Pitch rotation around X axis
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective focal projection
    const distance = this.focalLength + 900;
    const denom = distance + z2;
    if (denom <= 10) {
      return { px: 0, py: 0, scale: 0, visible: false, z: z2 };
    }

    const scale = distance / denom;
    const px = centerX + x1 * scale;
    const py = centerY + y2 * scale;

    return {
      px,
      py,
      scale,
      visible: z2 > -800, // Z-clip threshold
      z: z2
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. MAIN RENDER LOOP (60fps–120fps)
  // ─────────────────────────────────────────────────────────────
  render() {
    if (this.isPaused) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // 1. Camera Smoothing & Auto-Drift
    if (this.autoDrift && !this.isDragging) {
      this.targetRotY += this.driftSpeed;
    }

    // Subtle parallax tilt towards pointer when idle
    const parallaxTiltX = ((this.pointerY - cy) / cy) * 0.08;
    const parallaxTiltY = ((this.pointerX - cx) / cx) * 0.08;

    this.rotX += ((this.targetRotX + parallaxTiltX) - this.rotX) * 0.055;
    this.rotY += ((this.targetRotY + parallaxTiltY) - this.rotY) * 0.055;
    this.focalLength += (this.targetFocal - this.focalLength) * 0.07;

    const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
    const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);

    // 2. Clear canvas with velvet gothic nocturnal vignette
    ctx.fillStyle = "#07040c";
    ctx.fillRect(0, 0, w, h);

    // Deep Cosmic Nebula Nebulosity
    const grad = ctx.createRadialGradient(cx, cy * 0.75, 40, cx, cy, Math.max(w, h) * 0.85);
    grad.addColorStop(0, "rgba(58, 22, 74, 0.28)");
    grad.addColorStop(0.45, "rgba(22, 14, 38, 0.22)");
    grad.addColorStop(0.85, "rgba(8, 5, 14, 0.45)");
    grad.addColorStop(1, "rgba(4, 2, 8, 0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 3. Project All Stars into Screen Space
    let closestMajor = null;
    let closestDist = 42;

    const pointer = { x: this.pointerX, y: this.pointerY };

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const p = this.project(s.x, s.y, s.z, cx, cy, cosX, sinX, cosY, sinY);
      s.px = p.px;
      s.py = p.py;
      s.pz = p.z;
      s.scale = p.scale;
      s.visible = p.visible;

      // Check hover for major stars
      if (s.isMajor && s.visible) {
        const d = Math.hypot(s.px - pointer.x, s.py - pointer.y);
        if (d < closestDist) {
          closestDist = d;
          closestMajor = s;
        }
      }
    }
    this.hoveredStar = closestMajor;

    // 4. Render 3D Armillary Astrolabe Coordinate Rings
    if (this.showAstrolabeRings) {
      this.renderAstrolabeRings(ctx, cx, cy, cosX, sinX, cosY, sinY);
    }

    // 5. Render Constellation Vector Lines
    if (this.showConstellations) {
      this.renderConstellations(ctx);
    }

    // 6. Dynamic Cursor Constellation Weaving (Filaments to nearest stars)
    this.renderCursorFilaments(ctx, pointer);

    // 7. Render Stars
    this.renderStars(ctx);

    // 8. Render Gravitational Shockwave Ripples
    this.renderPulses(ctx);

    // 9. Render Candle Bloom Flash (if triggered)
    if (this.bloomAlpha > 0.005) {
      ctx.fillStyle = `rgba(255, 215, 120, ${this.bloomAlpha * 0.35})`;
      ctx.fillRect(0, 0, w, h);
      this.bloomAlpha *= 0.95;
    }

    // 10. Render Hovered Star Gothic Astrolabe Callout Tooltip
    if (this.hoveredStar) {
      this.renderStarTooltip(ctx, this.hoveredStar);
    }

    // 11. Update HUD Coordinates (if HUD element present)
    this.updateHUDReadout();

    // Loop
    this.animFrameId = requestAnimationFrame(() => this.render());
  }

  // ─────────────────────────────────────────────────────────────
  // 7. SUB-RENDERERS
  // ─────────────────────────────────────────────────────────────
  renderAstrolabeRings(ctx, cx, cy, cosX, sinX, cosY, sinY) {
    ctx.lineWidth = 1.0;
    this.astrolabeRings.forEach(ring => {
      ctx.strokeStyle = ring.strokeColor;
      ctx.globalAlpha = ring.alpha;
      ctx.beginPath();
      let started = false;

      ring.points.forEach(pt => {
        const p = this.project(pt.x, pt.y, pt.z, cx, cy, cosX, sinX, cosY, sinY);
        if (!p.visible) return;

        if (!started) {
          ctx.moveTo(p.px, p.py);
          started = true;
        } else {
          ctx.lineTo(p.px, p.py);
        }

        // Degree ticks on armillary astrolabe
        if (pt.isTick) {
          ctx.fillStyle = ring.strokeColor;
          ctx.fillRect(p.px - 1, p.py - 1, 2, 2);
        }
      });
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;
  }

  renderConstellations(ctx) {
    ctx.lineWidth = 1.2;
    this.constellationLinks.forEach(([nameA, nameB]) => {
      const idxA = this.majorStarIndexMap[nameA];
      const idxB = this.majorStarIndexMap[nameB];
      if (idxA === undefined || idxB === undefined) return;

      const sA = this.stars[idxA];
      const sB = this.stars[idxB];
      if (!sA.visible || !sB.visible) return;

      // Depth fading
      const avgZ = (sA.pz + sB.pz) / 2;
      const alpha = Math.max(0.12, Math.min(0.55, (1200 - avgZ) / 1600));

      // Delicate golden-cyan constellation filament
      ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(sA.px, sA.py);
      ctx.lineTo(sB.px, sB.py);
      ctx.stroke();
    });
  }

  renderCursorFilaments(ctx, pointer) {
    const nearby = [];
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (!s.visible) continue;
      const dist = Math.hypot(s.px - pointer.x, s.py - pointer.y);
      if (dist < 135) {
        nearby.push({ star: s, dist });
      }
    }

    if (nearby.length === 0) return;
    nearby.sort((a, b) => a.dist - b.dist);

    // Connect mouse beacon to top 3 nearest stars
    const maxConnect = Math.min(3, nearby.length);
    ctx.lineWidth = 1.0;

    for (let i = 0; i < maxConnect; i++) {
      const { star, dist } = nearby[i];
      const alpha = (1 - dist / 135) * 0.45;
      ctx.strokeStyle = `rgba(160, 226, 255, ${alpha})`;

      ctx.beginPath();
      ctx.moveTo(pointer.x, pointer.y);
      ctx.lineTo(star.px, star.py);
      ctx.stroke();

      // Golden flare on near star
      ctx.fillStyle = `rgba(255, 230, 140, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.px, star.py, star.baseR * star.scale * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gentle beacon reticle around cursor
    ctx.strokeStyle = "rgba(212, 175, 55, 0.22)";
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderStars(ctx) {
    const now = performance.now() * 0.001;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (!s.visible) continue;

      const twinkle = 0.75 + Math.sin(now * s.twinkleSpeed * 10 + s.twinklePhase) * 0.25;
      const r = Math.max(0.6, s.baseR * s.scale * twinkle);

      // Depth fog fading
      const depthAlpha = Math.max(0.18, Math.min(1.0, (1100 - s.pz) / 1400));

      ctx.globalAlpha = depthAlpha;

      if (s.isMajor) {
        // Radiant halo for major historical stars
        const haloGrad = ctx.createRadialGradient(s.px, s.py, 0, s.px, s.py, r * 4.5);
        haloGrad.addColorStop(0, s.color);
        haloGrad.addColorStop(0.35, "rgba(212, 175, 55, 0.35)");
        haloGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(s.px, s.py, r * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 4-point Diamond Diffraction Cross
        if (s.mag < 1.6) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.8;
          const spikeLen = r * 3.8;
          ctx.beginPath();
          ctx.moveTo(s.px - spikeLen, s.py);
          ctx.lineTo(s.px + spikeLen, s.py);
          ctx.moveTo(s.px, s.py - spikeLen);
          ctx.lineTo(s.px, s.py + spikeLen);
          ctx.stroke();
        }
      }

      // Star Core
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.px, s.py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  renderPulses(ctx) {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.radius += 5.5;
      p.strength = Math.max(0, 1 - p.radius / p.maxRadius);

      if (p.strength <= 0) {
        this.pulses.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(212, 175, 55, ${p.strength * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderStarTooltip(ctx, star) {
    const title = `✠ ${star.name.toUpperCase()}`;
    const subtitle = `${star.constell}${star.label ? " • " + star.label : ""}`;
    const raHours = (star.ra * (12 / Math.PI)).toFixed(1);
    const decDeg = (star.dec * (180 / Math.PI)).toFixed(0);
    const meta = `RA ${raHours}h • DEC ${decDeg > 0 ? "+" : ""}${decDeg}° • Mag ${star.mag}`;

    const fontTitle = "bold 11px 'Cinzel Decorative', 'MedievalSharp', serif";
    const fontSubtitle = "italic 11px 'Cormorant Garamond', Georgia, serif";
    const fontMeta = "9.5px monospace, Courier, sans-serif";

    ctx.font = fontTitle;
    const w1 = ctx.measureText(title).width;
    ctx.font = fontSubtitle;
    const w2 = ctx.measureText(subtitle).width;
    ctx.font = fontMeta;
    const w3 = ctx.measureText(meta).width;

    const padX = 14;
    const boxW = Math.ceil(Math.max(w1, w2, w3)) + padX * 2;
    const boxH = 56;

    let x = star.px + 14;
    let y = star.py - 12;

    // Viewport collision avoidance
    if (x + boxW > this.width - 12) {
      x = star.px - boxW - 14;
    }
    if (x < 12) {
      x = 12;
    }
    if (y + boxH - 14 > this.height - 12) {
      y = this.height - boxH - 12 + 14;
    }
    if (y - 14 < 12) {
      y = 26;
    }

    // Tooltip Card
    ctx.fillStyle = "rgba(14, 9, 22, 0.94)";
    ctx.strokeStyle = "rgba(212, 175, 55, 0.75)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y - 14, boxW, boxH, 6);
    } else {
      ctx.rect(x, y - 14, boxW, boxH);
    }
    ctx.fill();
    ctx.stroke();

    // Text Lines
    ctx.fillStyle = "#ffd56b";
    ctx.font = fontTitle;
    ctx.fillText(title, x + padX, y + 2);

    ctx.fillStyle = "#e0d5c1";
    ctx.font = fontSubtitle;
    ctx.fillText(subtitle, x + padX, y + 18);

    ctx.fillStyle = "#9fb6d0";
    ctx.font = fontMeta;
    ctx.fillText(meta, x + padX, y + 33);
  }

  updateHUDReadout() {
    const el = document.getElementById("stellarCoordsLabel");
    if (!el) return;

    // Convert current yaw & pitch into Right Ascension & Declination
    let raH = ((-this.rotY % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) * (12 / Math.PI);
    let decD = this.rotX * (180 / Math.PI);

    const raStr = `${Math.floor(raH)}h ${Math.floor((raH % 1) * 60)}m`;
    const decStr = `${decD >= 0 ? "+" : ""}${Math.floor(decD)}°`;

    el.textContent = `✦ RA ${raStr} • DEC ${decStr}`;
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
  window.stellarMap = new StellarMap("stellarMapCanvas");
});
