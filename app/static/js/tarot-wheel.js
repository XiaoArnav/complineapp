/**
 * Gothic Tarot Wheel & Clockwork Gear Synthesizer
 * Powers the interactive spinning Stained Glass Rose Window (Rota Fortunae)
 * Synthesizes procedural mechanical clockwork ratchet teeth & draws a Gothic Slumber Tarot Card.
 */

class GothicTarotWheel {
  constructor() {
    this.wheelEl = null;
    this.wrapperEl = null;
    this.modalEl = null;
    this.isSpinning = false;
    this.currentRotation = 0;
    this.audioCtx = null;

    // Deck of 8 Gothic Slumber Tarot Cards
    this.deck = [
      {
        numeral: "Arcana 0",
        title: "The Cathedral Sloth",
        subtitle: "The Patron of Stillness",
        icon: "🦥",
        meaning: "The greatest wisdom is the courage to do nothing. Hang from the high rafters of your mind and let the heavy world turn below without you.",
        blessing: "✨ Sleep Blessing: Freedom from all haste and unfinished chores."
      },
      {
        numeral: "Arcana II",
        title: "The Nocturnal Owl",
        subtitle: "The Silent Watcher",
        icon: "🦉",
        meaning: "In the velvet darkness, true sight requires closed eyes. The nocturnal sentinel perches beside you, guarding your slumber with quiet wings.",
        blessing: "✨ Sleep Blessing: Deep psychic calm and shelter from bad dreams."
      },
      {
        numeral: "Arcana IX",
        title: "The Beeswax Candle",
        subtitle: "The Gentle Hearth",
        icon: "🕯️",
        meaning: "A solitary golden flame wavers softly in the stone alcove, warming the cold drafts and keeping the night gentle, intimate, and safe.",
        blessing: "✨ Sleep Blessing: Coziness and physical warmth."
      },
      {
        numeral: "Arcana X",
        title: "The Stained Glass Rose",
        subtitle: "The Wheel of Rest",
        icon: "☸️",
        meaning: "The daylight sun has faded into cool moonlit jewel tones. The cycle of labor has ended; the sacred hour of rest has arrived.",
        blessing: "✨ Sleep Blessing: Restores natural circadian harmony."
      },
      {
        numeral: "Arcana IV",
        title: "The Stone Gargoyle",
        subtitle: "The Granite Sentinel",
        icon: "🗿",
        meaning: "Ten-foot walls of ancient granite shelter your chamber. The patient stone has weathered a thousand storms; tonight, you are completely safe.",
        blessing: "✨ Sleep Blessing: Absolute grounding and tranquility."
      },
      {
        numeral: "Arcana XIV",
        title: "The Abbey Rain",
        subtitle: "The Weeping Glass",
        icon: "🌧️",
        meaning: "Relentless, rhythmic rain drums upon the leaded windowpane, washing away the mental dust and overthinking of the past day.",
        blessing: "✨ Sleep Blessing: Cleansing of anxiety and deep muscle release."
      },
      {
        numeral: "Arcana XIV",
        title: "The Midnight Chime",
        subtitle: "The Bronze Bell",
        icon: "🔔",
        meaning: "A single, low bronze strike echoes from the tower across the valley, lingering in the mist before slowly dissolving into eternal stillness.",
        blessing: "✨ Sleep Blessing: Melts away mental chatter."
      },
      {
        numeral: "Arcana XXI",
        title: "The Closed Vellum",
        subtitle: "The Finished Chapter",
        icon: "📜",
        meaning: "The ink has dried upon the manuscript. There are no more lines to write tonight. Close the heavy clasps of the book and rest.",
        blessing: "✨ Sleep Blessing: Permission to let go of the day."
      }
    ];
  }

  init() {
    this.wrapperEl = document.querySelector(".rose-window-wrapper");
    this.wheelEl = document.getElementById("roseWheel");
    this.modalEl = document.getElementById("tarotModal");

    if (this.wrapperEl) {
      this.wrapperEl.addEventListener("click", () => this.spin());
    }

    // Modal dismiss listeners
    if (this.modalEl) {
      const dismissBtn = document.getElementById("btnTarotDismiss");
      if (dismissBtn) {
        dismissBtn.addEventListener("click", () => this.closeModal());
      }
      this.modalEl.addEventListener("click", (e) => {
        if (e.target === this.modalEl) this.closeModal();
      });

      const weaveBtn = document.getElementById("btnTarotWeave");
      if (weaveBtn) {
        weaveBtn.addEventListener("click", () => {
          const cardTitle = document.getElementById("tarotTitle").textContent;
          this.closeModal();
          const moodInput = document.getElementById("moodInput");
          if (moodInput) {
            moodInput.value = cardTitle;
            const btnSummon = document.getElementById("btnSummon");
            if (btnSummon) btnSummon.click();
          }
        });
      }
    }
  }

  // --- Web Audio Mechanical Clockwork Gear Ratchet Synthesizer ---
  _getAudioContext() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AC();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playGearToothClick(pitch = 2800, volume = 0.3) {
    const ctx = this._getAudioContext();
    const t = ctx.currentTime;

    // Metallic tooth strike
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
    const t = ctx.currentTime;

    // Heavy iron lock latch thunk
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

    // High metal snap
    this.playGearToothClick(3400, 0.4);
  }

  playGearSpinSoundSequence(durationMs = 4200) {
    // Schedule decelerating gear ratchet clicks
    let elapsed = 0;
    let currentInterval = 30; // ms between teeth initially (fast whirl)

    const scheduleClick = () => {
      if (elapsed >= durationMs) {
        this.playMechanicalLatch();
        return;
      }

      // Slightly randomize pitch for realistic mechanical metal teeth
      const pitch = 2600 + (Math.random() * 500 - 250);
      const vol = Math.max(0.12, 0.35 * (1 - (elapsed / durationMs) * 0.5));
      this.playGearToothClick(pitch, vol);

      // Deceleration curve: interval grows exponentially as wheel slows down
      currentInterval += Math.pow(elapsed / durationMs, 2.2) * 22 + 1.2;
      elapsed += currentInterval;

      setTimeout(scheduleClick, currentInterval);
    };

    scheduleClick();
  }

  // --- Wheel Spin Logic ---
  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // 4 to 6 full turns + random slice (1440 to 2160 deg)
    const extraRotations = 4 + Math.floor(Math.random() * 3);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalSpinDegrees = extraRotations * 360 + randomAngle;
    this.currentRotation += totalSpinDegrees;

    // Start mechanical gear sound
    this.playGearSpinSoundSequence(4200);

    // Apply CSS transform rotation
    if (this.wheelEl) {
      this.wheelEl.style.transform = `rotate(${this.currentRotation}deg)`;
    }

    // Pick card based on final normalized angle
    const normalizedAngle = (360 - (this.currentRotation % 360)) % 360;
    const sliceAngle = 360 / this.deck.length;
    const cardIndex = Math.floor(normalizedAngle / sliceAngle) % this.deck.length;
    const drawnCard = this.deck[cardIndex];

    // Reveal card modal when spin comes to a rest
    setTimeout(() => {
      this.isSpinning = false;
      this.showTarotCard(drawnCard);
    }, 4500);
  }

  showTarotCard(card) {
    if (!this.modalEl) return;

    document.getElementById("tarotNumeral").textContent = card.numeral;
    document.getElementById("tarotIcon").textContent = card.icon;
    document.getElementById("tarotTitle").textContent = card.title;
    document.getElementById("tarotSubtitle").textContent = card.subtitle;
    document.getElementById("tarotMeaning").textContent = `"${card.meaning}"`;
    document.getElementById("tarotBlessing").textContent = card.blessing;

    this.modalEl.classList.add("active");
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove("active");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.tarotWheel = new GothicTarotWheel();
  window.tarotWheel.init();
});
