/**
 * Candle Intro & Lifecycle Controller
 * Handles:
 *  1. Cinematic intro: pure black → match strike → candle lights → site fades in
 *  2. Interactive candle: click → wind blow-out → dark mode
 *                         click again → wind re-light → site restores
 */

class CandleIntro {
  constructor() {
    this.lit = false;         // true once candle is fully burning
    this.introPlayed = false;
    this.overlay = document.getElementById('introOverlay');
    this.candleEl = document.getElementById('mainCandle');
    this.mainContent = document.getElementById('mainContent');
    this.siteBody = document.body;

    // bind so we can remove the listener later
    this._handleCandleClick = this._handleCandleClick.bind(this);
  }

  /** Entry point — called once on DOMContentLoaded */
  start() {
    this.restart();
  }

  restart() {
    this.lit = false;
    this.introPlayed = false;

    // Reset overlay and main content to initial pitch-black state
    if (this.mainContent) {
      this.mainContent.style.opacity = '0';
      this.mainContent.classList.remove('fade-in-lit');
    }

    if (this.overlay) {
      this.overlay.style.display = 'flex';
      this.overlay.style.opacity = '1';
      this.overlay.classList.remove('dissolve');

      const candle = this.overlay.querySelector('.intro-candle-wrap');
      if (candle) {
        candle.classList.remove('match-flash', 'flame-on', 'halo-expand');
      }

      const introFlame = document.getElementById('introFlame');
      if (introFlame) {
        introFlame.style.display = 'none';
        introFlame.setAttribute('display', 'none');
        introFlame.style.opacity = '0';
        introFlame.style.visibility = 'hidden';
        introFlame.classList.remove('candle-flame-live');
      }
    }

    // Begin sequence after a short paint delay
    setTimeout(() => this._playIntro(), 250);
  }

  // ─────────────────────────────────────────────────────────────
  // INTRO SEQUENCE
  // Process requested by user:
  // 1. First, the candle was OFF (complete pitch-black darkness)
  // 2. Then it lit up (match strikes -> wick catches fire -> candle flame burns in the dark)
  // 3. And then the surrounding becomes bright (golden halo expands to fill the room)
  // 4. Cathedral scriptorium reveals
  // ─────────────────────────────────────────────────────────────
  _playIntro() {
    const candle = this.overlay.querySelector('.intro-candle-wrap');
    const introFlame = document.getElementById('introFlame');

    // Ensure flame is strictly hidden initially
    if (introFlame) {
      introFlame.style.display = 'none';
      introFlame.setAttribute('display', 'none');
      introFlame.style.opacity = '0';
      introFlame.style.visibility = 'hidden';
      introFlame.classList.remove('candle-flame-live');
    }

    // Step 1: Candle is strictly OFF in pitch-black silence (850ms pause)
    setTimeout(() => {

      // Step 2A: Match strike sound and concentrated spark at the cold wick
      try { if (window.candleSound) window.candleSound.playMatchStrike(); } catch (e) {}
      candle.classList.add('match-flash');

      // Step 2B: 350ms later, match sparks the wick -> Candle lits up!
      setTimeout(() => {
        candle.classList.remove('match-flash');
        try { if (window.candleSound) window.candleSound.playCandleCatch(); } catch (e) {}

        // Candle flame turns ON!
        if (introFlame) {
          introFlame.style.display = 'block';
          introFlame.removeAttribute('display');
          introFlame.style.opacity = '1';
          introFlame.style.visibility = 'visible';
          introFlame.classList.add('candle-flame-live');
        }
        candle.classList.add('flame-on'); // Flame is now flickering in the dark!
        try { if (window.stellarMap) window.stellarMap.triggerCelestialBloom(); } catch (e) {}

        // Step 3: Candle has been burning alone in the dark for 1.3s ->
        // NOW the surrounding becomes bright as the golden halo expands outward!
        setTimeout(() => {
          candle.classList.add('halo-expand'); // Golden light floods the surrounding dark!
          try { if (window.stellarMap) window.stellarMap.triggerCelestialBloom(); } catch (e) {}

          // Step 4: Surrounding is bright, cathedral sanctuary fades into view
          setTimeout(() => {
            this.overlay.classList.add('dissolve');       // overlay fades out
            this.overlay.style.pointerEvents = 'none';
            this.mainContent.classList.add('fade-in-lit');// main content appears

            setTimeout(() => {
              this.overlay.style.display = 'none';
              this.overlay.style.visibility = 'hidden';
              this.lit = true;
              this.introPlayed = true;
              this._attachCandleListener();
            }, 800);

          }, 1800);

        }, 1300); // 1.3s pause where candle is lit before surrounding brightens

      }, 350);

    }, 850); // 850ms of quiet pitch-black unlit candle
  }

  // ─────────────────────────────────────────────────────────────
  // INTERACTIVE CANDLE (sidebar)
  // ─────────────────────────────────────────────────────────────
  _attachCandleListener() {
    const wrapper = document.getElementById('candleWrapper');
    if (wrapper) wrapper.addEventListener('click', this._handleCandleClick);
  }

  _handleCandleClick() {
    if (!this.introPlayed) return; // ignore clicks during intro

    if (this.lit) {
      this._blowOut();
    } else {
      this._relight();
    }
  }

  _blowOut() {
    this.lit = false;
    try { if (window.candleSound) window.candleSound.playWindBlowOut(); } catch (e) {}

    // Wind puff wobble on wrapper
    const wrapper = document.getElementById('candleWrapper');
    if (wrapper) {
      wrapper.classList.add('wind-puff');
      wrapper.classList.add('candle-dead');
      setTimeout(() => wrapper.classList.remove('wind-puff'), 600);
    }

    // 1. Flame dies
    const flame = document.getElementById('mainCandleFlame');
    if (flame) flame.classList.add('flame-dead');

    // 2. Wick droops, char tip appears
    const wickLit  = document.getElementById('wickLit');
    const wickGlow = document.getElementById('wickGlow');
    const wickDead = document.getElementById('wickDead');
    const charTip  = document.getElementById('charTip');
    if (wickLit)  wickLit.classList.add('wick-hide');
    if (wickGlow) wickGlow.classList.add('wick-hide');
    if (wickDead) wickDead.classList.add('wick-show');
    if (charTip)  charTip.classList.add('char-show');

    // 3. Wax body cools to dark colour
    const waxBody = document.getElementById('waxBody');
    if (waxBody) waxBody.classList.add('wax-dead');

    // 4. Halo fades
    const halo = document.getElementById('candleHalo');
    if (halo) halo.classList.add('halo-dead');

    // 5. Smoke wisps rise and fade — reset, then activate
    const smoke = document.getElementById('smokeContainer');
    if (smoke) {
      smoke.classList.remove('smoke-active');
      // Re-clone wisp paths to re-trigger keyframe animations
      smoke.querySelectorAll('.smoke-wisp').forEach(w => {
        const clone = w.cloneNode(true);
        w.parentNode.replaceChild(clone, w);
      });
      void smoke.offsetWidth; // force reflow
      smoke.classList.add('smoke-active');
      // Smoke fully gone after ~4.3 s
      setTimeout(() => smoke.classList.remove('smoke-active'), 4300);
    }

    // 6. Site dims to dark gothic mode
    document.body.classList.add('gothic-dark-mode');
    if (window.stellarMap) {
      const rect = wrapper ? wrapper.getBoundingClientRect() : null;
      const px = rect ? rect.left + rect.width / 2 : window.innerWidth * 0.75;
      const py = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.35;
      window.stellarMap.triggerGravitationalPulse(px, py);
    }

    document.getElementById('candleStatus').textContent =
      'The flame sleeps — click to wake the wind';
  }

  _relight() {
    this.lit = true;
    try { if (window.candleSound) window.candleSound.playWindRelight(); } catch (e) {}

    // Wind puff
    const wrapper = document.getElementById('candleWrapper');
    if (wrapper) {
      wrapper.classList.add('wind-puff');
      wrapper.classList.remove('candle-dead');
      setTimeout(() => wrapper.classList.remove('wind-puff'), 600);
    }

    // 1. Kill smoke immediately
    const smoke = document.getElementById('smokeContainer');
    if (smoke) smoke.classList.remove('smoke-active');

    // 2. Restore wick
    const wickLit  = document.getElementById('wickLit');
    const wickGlow = document.getElementById('wickGlow');
    const wickDead = document.getElementById('wickDead');
    const charTip  = document.getElementById('charTip');
    if (wickLit)  wickLit.classList.remove('wick-hide');
    if (wickGlow) wickGlow.classList.remove('wick-hide');
    if (wickDead) wickDead.classList.remove('wick-show');
    if (charTip)  charTip.classList.remove('char-show');

    // 3. Restore wax colour
    const waxBody = document.getElementById('waxBody');
    if (waxBody) waxBody.classList.remove('wax-dead');

    // 4. Restore halo
    const halo = document.getElementById('candleHalo');
    if (halo) halo.classList.remove('halo-dead');

    // 5. Flame reborn burst
    const flame = document.getElementById('mainCandleFlame');
    if (flame) {
      flame.classList.remove('flame-dead');
      flame.classList.add('flame-reborn');
      try { if (window.stellarMap) window.stellarMap.triggerCelestialBloom(); } catch (e) {}
      setTimeout(() => flame.classList.remove('flame-reborn'), 800);
    }

    // 6. Restore site
    document.body.classList.remove('gothic-dark-mode');

    document.getElementById('candleStatus').textContent =
      'Beeswax flame lit — click to blow it out';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.candleIntro = new CandleIntro();
  window.restartIntro = () => window.candleIntro.restart();
  window.candleIntro.start();
});
