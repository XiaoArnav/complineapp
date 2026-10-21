/**
 * Gothic Tarot Wheel & 3D Levitating Tarot Sanctuary (Rota Fortunae)
 * Powers the interactive spinning Stained Glass Rose Window (Rota Fortunae)
 * Synthesizes procedural mechanical clockwork gear ratchets & materializes a live 3D floating tarot card.
 */

class GothicTarotWheel {
  constructor() {
    this.wheelEl = null;
    this.wrapperEl = null;
    this.modalEl = null;
    this.cardEl = null;
    this.stageEl = null;
    this.shadowEl = null;
    this.glareEl = null;
    this.backGlareEl = null;
    this.artworkChamberEl = null;

    this.isSpinning = false;
    this.currentRotation = 0;
    this.audioCtx = null;

    // 3D Physics & Interaction State
    this.isFlipped = false;
    this.isDragging = false;
    this.isMaterializing = false;
    this.cardRotX = 0;
    this.cardRotY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartRotX = 0;
    this.dragStartRotY = 0;
    this.hasDragged = false;
    this.flipAngle = 180;
    this.targetFlipAngle = 180;
    this.lastFlipTime = 0;
    this.animFrameId = null;
    this.currentCard = null;

    // Deck of 8 Gothic Slumber Tarot Cards
    this.deck = [
      {
        numeral: "ARCANUM XII",
        element: "EARTH",
        suit: "PENTACLES",
        title: "The Cathedral Sloth",
        subtitle: "Patron of Sacred Stillness",
        icon: "🦥",
        meaning: "The greatest wisdom is the courage to do nothing. Hang from the high vaulted rafters of your mind and let the heavy world turn below without you.",
        blessing: "✨ Sleep Blessing: Freedom from all haste and unfinished chores.",
        auraColor: "#d4af37",
        frequency: 216
      },
      {
        numeral: "ARCANUM XVIII",
        element: "AIR",
        suit: "SWORDS",
        title: "The Nocturnal Owl",
        subtitle: "The Silent Watcher",
        icon: "🦉",
        meaning: "In the velvet darkness, true sight requires closed eyes. The nocturnal sentinel perches beside you, guarding your slumber with quiet obsidian wings.",
        blessing: "✨ Sleep Blessing: Deep psychic calm and shelter from restless dreams.",
        auraColor: "#cb7ce3",
        frequency: 432
      },
      {
        numeral: "ARCANUM IX",
        element: "FIRE",
        suit: "WANDS",
        title: "The Beeswax Candle",
        subtitle: "The Gentle Hearth",
        icon: "🕯️",
        meaning: "A solitary golden flame wavers softly in the stone alcove, warming the cold drafts and keeping the night gentle, intimate, and safe.",
        blessing: "✨ Sleep Blessing: Pure physical coziness and peaceful warmth.",
        auraColor: "#f5a623",
        frequency: 528
      },
      {
        numeral: "ARCANUM X",
        element: "AETHER",
        suit: "WHEELS",
        title: "The Stained Glass Rose",
        subtitle: "The Wheel of Rest",
        icon: "☸️",
        meaning: "The daylight sun has faded into cool moonlit jewel tones. The cycle of labor has ended; the sacred monastic hour of Compline has arrived.",
        blessing: "✨ Sleep Blessing: Restores natural circadian harmony and ease.",
        auraColor: "#e83e8c",
        frequency: 396
      },
      {
        numeral: "ARCANUM IV",
        element: "STONE",
        suit: "RELICS",
        title: "The Stone Gargoyle",
        subtitle: "The Granite Sentinel",
        icon: "🗿",
        meaning: "Ten-foot walls of ancient granite shelter your chamber. The patient stone has weathered a thousand storms; tonight, you are completely safe.",
        blessing: "✨ Sleep Blessing: Absolute grounding, safety, and tranquility.",
        auraColor: "#8899a6",
        frequency: 174
      },
      {
        numeral: "ARCANUM XIV",
        element: "WATER",
        suit: "CUPS",
        title: "The Abbey Rain",
        subtitle: "The Weeping Glass",
        icon: "🌧️",
        meaning: "Relentless, rhythmic rain drums upon the leaded windowpane, washing away the mental dust, noise, and overthinking of the past day.",
        blessing: "✨ Sleep Blessing: Cleansing of anxiety and deep muscle release.",
        auraColor: "#4a90e2",
        frequency: 639
      },
      {
        numeral: "ARCANUM XV",
        element: "SOUND",
        suit: "CHIMES",
        title: "The Midnight Chime",
        subtitle: "The Bronze Bell",
        icon: "🔔",
        meaning: "A single, low bronze strike echoes from the cathedral tower across the misty valley, lingering in the air before slowly dissolving into eternal stillness.",
        blessing: "✨ Sleep Blessing: Melts away mental chatter and wandering thoughts.",
        auraColor: "#a8842c",
        frequency: 288
      },
      {
        numeral: "ARCANUM XXI",
        element: "MEMORY",
        suit: "TOMES",
        title: "The Closed Vellum",
        subtitle: "The Finished Chapter",
        icon: "📜",
        meaning: "The ink has dried upon the manuscript. There are no more lines to write tonight. Close the heavy brass clasps of the tome and drift to sleep.",
        blessing: "✨ Sleep Blessing: Sacred permission to let go of the day.",
        auraColor: "#c99a3e",
        frequency: 741
      }
    ];
  }

  init() {
    this.wrapperEl = document.querySelector(".rose-window-wrapper");
    this.wheelEl = document.getElementById("roseWheel");
    this.modalEl = document.getElementById("tarotModal");
    this.cardEl = document.getElementById("tarot3dCard");
    this.stageEl = document.getElementById("tarot3dStage");
    this.shadowEl = document.getElementById("tarotCardShadow");
    this.glareEl = document.getElementById("tarotGlare");
    this.backGlareEl = document.getElementById("tarotBackGlare");
    this.artworkChamberEl = document.getElementById("tarotArtworkChamber");

    if (this.wrapperEl) {
      this.wrapperEl.addEventListener("click", () => this.spin());
    }

    this.bind3DInteractivity();
  }

  // --- Web Audio Mechanical & Celestial Sound Engine ---
  _getAudioContext() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.audioCtx = new AC();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playGearToothClick(pitch = 2800, volume = 0.3) {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, t + 0.012);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = pitch;
    filter.Q.value = 8.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);
  }

  playMechanicalLatch() {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);

    this.playGearToothClick(3400, 0.4);
  }

  playGearSpinSoundSequence(durationMs = 4200) {
    let elapsed = 0;
    let currentInterval = 30;

    const scheduleClick = () => {
      if (elapsed >= durationMs) {
        this.playMechanicalLatch();
        return;
      }
      const pitch = 2600 + (Math.random() * 500 - 250);
      const vol = Math.max(0.12, 0.35 * (1 - (elapsed / durationMs) * 0.5));
      this.playGearToothClick(pitch, vol);

      currentInterval += Math.pow(elapsed / durationMs, 2.2) * 22 + 1.2;
      elapsed += currentInterval;

      setTimeout(scheduleClick, currentInterval);
    };

    scheduleClick();
  }

  // Materialization Ethereal Whoosh & Celestial Harmonics
  playCardDrawWhoosh() {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    try {
      // 1. Astral Wind Resonant Sweep
      const bufferSize = ctx.sampleRate * 1.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.25;
        output[i] = (b0 + b1 + b2) * 0.25;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(180, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.7);
      filter.frequency.exponentialRampToValueAtTime(260, t + 1.3);
      filter.Q.value = 2.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);

      // 2. Shimmering Pentatonic Celestial Chimes
      [370, 440, 554, 740, 1108].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + 0.25 + idx * 0.09);
        oscGain.gain.setValueAtTime(0.001, t + 0.25 + idx * 0.09);
        oscGain.gain.linearRampToValueAtTime(0.07, t + 0.35 + idx * 0.09);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(t + 0.25 + idx * 0.09);
        osc.stop(t + 2.3);
      });
    } catch (e) {}
  }

  // Crisp Parchment / Card Snap SFX on 3D Flip
  playCardFlipSound() {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(700, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.07);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // Sacred Singing Bowl & Cathedral Harmonic Resonance
  playCommuneChime(freq = 432) {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    try {
      const harmonics = [1, 2.76, 5.4];
      const vols = [0.38, 0.14, 0.05];

      harmonics.forEach((h, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * h, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(vols[i], t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2 - i * 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 3.3);
      });
    } catch (e) {}
  }

  // --- Wheel Spin Execution ---
  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const extraRotations = 4 + Math.floor(Math.random() * 3);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalSpinDegrees = extraRotations * 360 + randomAngle;
    this.currentRotation += totalSpinDegrees;

    this.playGearSpinSoundSequence(4200);

    if (this.wheelEl) {
      this.wheelEl.style.transform = `rotate(${this.currentRotation}deg)`;
    }

    const normalizedAngle = (360 - (this.currentRotation % 360)) % 360;
    const sliceAngle = 360 / this.deck.length;
    const cardIndex = Math.floor(normalizedAngle / sliceAngle) % this.deck.length;
    const drawnCard = this.deck[cardIndex];

    setTimeout(() => {
      this.isSpinning = false;
      this.showTarotCard(drawnCard);
    }, 4500);
  }

  // --- 3D Card Presentation & Materialization ---
  showTarotCard(card) {
    if (!this.modalEl || !this.cardEl) return;
    this.currentCard = card;
    this.isFlipped = true; // Initially facedown showing back face (Click to reveal!)
    this.hasBeenRevealed = false;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.cardRotX = 0;
    this.cardRotY = 0;
    this.flipAngle = 180;
    this.targetFlipAngle = 180;
    this.lastFlipTime = 0;

    if (this.cardEl) {
      this.cardEl.classList.add("is-facedown");
      this.cardEl.classList.remove("is-faceup");
    }

    // Update button text to "Reveal Prophecy" if button present
    this.updateFlipButtonState();

    // Populate Card Front Elements
    const elNum = document.getElementById("tarotNumeral");
    const elElem = document.getElementById("tarotElement");
    const elSuit = document.getElementById("tarotSuit");
    const elIcon = document.getElementById("tarotIcon");
    const elTitle = document.getElementById("tarotTitle");
    const elSub = document.getElementById("tarotSubtitle");
    const elMean = document.getElementById("tarotMeaning");
    const elBless = document.getElementById("tarotBlessing");
    const elAura = document.getElementById("tarotArtworkAura");

    if (elNum) elNum.textContent = card.numeral;
    if (elElem) elElem.textContent = card.element;
    if (elSuit) elSuit.textContent = card.suit;
    if (elIcon) elIcon.textContent = card.icon;
    if (elTitle) elTitle.textContent = card.title;
    if (elSub) elSub.textContent = card.subtitle;
    if (elMean) elMean.textContent = `"${card.meaning}"`;
    if (elBless) elBless.innerHTML = `<span class="blessing-sparkle">✨</span> ${card.blessing.replace("✨ Sleep Blessing: ", "")}`;
    if (elAura && card.auraColor) {
      elAura.style.background = `radial-gradient(circle, ${card.auraColor}66 0%, transparent 70%)`;
    }

    // Materialize in 3D: play whoosh and trigger entry animation
    this.playCardDrawWhoosh();
    this.cardEl.classList.remove("materializing");
    void this.cardEl.offsetWidth; // Force reflow
    this.cardEl.classList.add("materializing");
    this.isMaterializing = true;

    this.modalEl.classList.add("active");
    this.modalEl.setAttribute("aria-hidden", "false");

    // After entry finishes, start live floating physics loop
    setTimeout(() => {
      this.isMaterializing = false;
      this.cardEl.classList.remove("materializing");
      this.startFloatingLoop();
    }, 1100);
  }

  updateFlipButtonState() {
    const btnFlip = document.getElementById("btnTarotFlip");
    if (!btnFlip) return;
    if (this.isFlipped) {
      btnFlip.innerHTML = '<span class="tool-icon">✨</span> Reveal Prophecy';
      btnFlip.classList.add("unrevealed");
    } else {
      btnFlip.innerHTML = '<span class="tool-icon">🔄</span> Flip Card';
      btnFlip.classList.remove("unrevealed");
    }
  }

  // --- 3D Levitation & Physics Animation Loop ---
  startFloatingLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const loop = () => {
      if (!this.modalEl || !this.modalEl.classList.contains("active")) {
        return;
      }

      // Idle bobbing & breathing sine wave in anti-gravity
      const time = performance.now() * 0.0016;
      const floatY = Math.sin(time) * 9;
      const floatRotZ = Math.cos(time * 0.7) * 1.5;

      // Smooth interpolation (lerp) towards target mouse tilt
      if (!this.isDragging) {
        this.cardRotX += (this.targetRotX - this.cardRotX) * 0.12;
        this.cardRotY += (this.targetRotY - this.cardRotY) * 0.12;
      }

      // Smooth 3D flip rotation physics (180deg = card back, 0deg = prophecy front)
      const flipDiff = this.targetFlipAngle - this.flipAngle;
      if (Math.abs(flipDiff) < 0.2) {
        this.flipAngle = this.targetFlipAngle;
      } else {
        this.flipAngle += flipDiff * 0.16;
      }
      const finalRotY = this.cardRotY + this.flipAngle;

      if (this.cardEl) {
        this.cardEl.style.transform = `translate3d(0, ${floatY}px, 0) rotateX(${this.cardRotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) rotateZ(${floatRotZ.toFixed(2)}deg)`;
      }

      // Shadow reacts to height and tilt
      if (this.shadowEl) {
        const shadowScale = Math.max(0.7, 1 - floatY * 0.02);
        const shadowOpacity = Math.max(0.4, 0.75 - floatY * 0.03);
        const shadowShiftX = -this.cardRotY * 1.2;
        this.shadowEl.style.transform = `translate3d(${shadowShiftX}px, 0, -90px) scale(${shadowScale})`;
        this.shadowEl.style.opacity = shadowOpacity.toString();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  stopFloatingLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // --- 3D Event Listeners: Mouse Parallax, Drag & Flip ---
  bind3DInteractivity() {
    if (!this.modalEl || !this.cardEl) return;

    // A. Native Touch Support (Mobile / Tablet / Touchscreen)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    const handleTouchStart = (e) => {
      if (this.isMaterializing) return;
      if (e.target.closest(".tarot-3d-toolbar") || e.target.closest("button") || e.target.closest("a")) return;
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchMoved = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        if (Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY) > 22) {
          touchMoved = true;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (this.isMaterializing) return;
      if (e.target.closest(".tarot-3d-toolbar") || e.target.closest("button") || e.target.closest("a")) return;
      if (!touchMoved) {
        this.flipCard();
      }
    };

    this.cardEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    this.cardEl.addEventListener("touchmove", handleTouchMove, { passive: true });
    this.cardEl.addEventListener("touchend", handleTouchEnd);

    if (this.stageEl) {
      this.stageEl.addEventListener("touchstart", handleTouchStart, { passive: true });
      this.stageEl.addEventListener("touchmove", handleTouchMove, { passive: true });
      this.stageEl.addEventListener("touchend", handleTouchEnd);
    }

    // B. Direct Native Click Support (Desktop / Laptop)
    const handleCardClick = (e) => {
      if (this.isMaterializing) return;
      if (e.target.closest(".tarot-3d-toolbar") || e.target.closest("button") || e.target.closest("a")) return;
      this.flipCard();
    };

    this.cardEl.addEventListener("click", handleCardClick);
    if (this.stageEl) {
      this.stageEl.addEventListener("click", handleCardClick);
    }

    // C. 3D Parallax & Optional Drag-to-Tilt
    let isMouseDown = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let hasDraggedDistance = false;

    this.modalEl.addEventListener("pointermove", (e) => {
      if (this.isMaterializing) return;

      if (isMouseDown) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        if (Math.hypot(deltaX, deltaY) > 25) {
          hasDraggedDistance = true;
          this.isDragging = true;
          if (this.cardEl) this.cardEl.classList.add("is-dragging");
          this.cardRotY = this.dragStartRotY + deltaX * 0.45;
          this.cardRotX = Math.max(-45, Math.min(45, this.dragStartRotX - deltaY * 0.45));
          this.targetRotX = this.cardRotX;
          this.targetRotY = this.cardRotY;
        }
      } else {
        const rect = this.cardEl.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        const offsetX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
        const offsetY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

        const maxTilt = 24; // max degrees tilt
        this.targetRotY = Math.max(-maxTilt, Math.min(maxTilt, offsetX * maxTilt));
        this.targetRotX = Math.max(-maxTilt, Math.min(maxTilt, -offsetY * maxTilt));

        // Update dynamic specular glare position
        const glareX = Math.max(10, Math.min(90, 50 + offsetX * 40));
        const glareY = Math.max(10, Math.min(90, 50 + offsetY * 40));
        const glareGrad = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.06) 45%, transparent 72%)`;

        if (this.glareEl) this.glareEl.style.background = glareGrad;
        if (this.backGlareEl) this.backGlareEl.style.background = glareGrad;
      }
    });

    this.cardEl.addEventListener("mousedown", (e) => {
      if (this.isMaterializing) return;
      if (e.target.closest(".tarot-3d-toolbar") || e.target.closest("button") || e.target.closest("a")) return;
      isMouseDown = true;
      hasDraggedDistance = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      this.dragStartRotX = this.cardRotX;
      this.dragStartRotY = this.cardRotY;
    });

    window.addEventListener("mouseup", () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      this.isDragging = false;
      if (this.cardEl) this.cardEl.classList.remove("is-dragging");
      if (hasDraggedDistance) {
        this.targetRotX = 0;
        this.targetRotY = 0;
      }
    });

    // Reset tilt when pointer leaves window
    document.addEventListener("mouseleave", () => {
      if (!isMouseDown) {
        this.targetRotX = 0;
        this.targetRotY = 0;
      }
    });

    // 4. Toolbar Buttons
    const btnWeave = document.getElementById("btnTarotWeave");
    if (btnWeave) {
      btnWeave.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.weaveDestiny();
      });
    }

    const btnDismiss = document.getElementById("btnTarotDismiss");
    if (btnDismiss) {
      btnDismiss.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
      });
    }

    // Backdrop click dismisses
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) {
        this.closeModal();
      }
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      if (!this.modalEl.classList.contains("active")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        this.closeModal();
      } else if (e.key === " " || e.key === "f" || e.key === "F") {
        e.preventDefault();
        this.flipCard();
      } else if (e.key === "Enter" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        this.weaveDestiny();
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        this.communeWithCard();
      }
    });
  }

  // --- Card Action: 3D Double-Sided Flip ---
  flipCard() {
    const now = performance.now();
    if (now - this.lastFlipTime < 240) return; // Debounce rapid double-triggers
    this.lastFlipTime = now;

    this.isFlipped = !this.isFlipped;
    this.targetFlipAngle = this.isFlipped ? 180 : 0;

    // Toggle active face class for bulletproof CSS z-index and pointer-events
    if (this.cardEl) {
      if (this.isFlipped) {
        this.cardEl.classList.add("is-facedown");
        this.cardEl.classList.remove("is-faceup");
      } else {
        this.cardEl.classList.add("is-faceup");
        this.cardEl.classList.remove("is-facedown");
      }
    }

    this.playCardFlipSound();
    this.updateFlipButtonState();

    // The first time the person flips the card, commune gets played on that click; after that it will not be played on that card
    if (!this.isFlipped && !this.hasBeenRevealed) {
      this.hasBeenRevealed = true;
      this.communeWithCard();
    }
  }

  // --- Card Action: Commune with Harmonic Resonance ---
  communeWithCard() {
    const card = this.currentCard;
    const freq = card && card.frequency ? card.frequency : 432;
    this.playCommuneChime(freq);

    // Visual shockwave on card artwork
    if (this.artworkChamberEl) {
      this.artworkChamberEl.classList.remove("communing");
      void this.artworkChamberEl.offsetWidth;
      this.artworkChamberEl.classList.add("communing");
    }

    const toast = document.getElementById("gothicToast");
    if (toast) {
      toast.textContent = `Sacred blessing attuned: ${card ? card.title : "Slumber Arcana"}`;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3500);
    }
  }

  // --- Card Action: Weave Tale into Gemma Engine ---
  weaveDestiny() {
    const card = this.currentCard;
    const cardTitle = card ? card.title : "The Cathedral Sloth";
    this.closeModal();

    const moodInput = document.getElementById("moodInput");
    if (moodInput) {
      moodInput.value = cardTitle;
      const btnSummon = document.getElementById("btnSummon");
      if (btnSummon) btnSummon.click();
    }
  }

  // --- Modal Teardown & Dissolve ---
  closeModal() {
    if (!this.modalEl) return;
    this.stopFloatingLoop();
    this.modalEl.classList.remove("active");
    this.modalEl.setAttribute("aria-hidden", "true");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.tarotWheel = new GothicTarotWheel();
  window.tarotWheel.init();
});
