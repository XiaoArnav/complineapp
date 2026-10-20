/**
 * Abbey Phonograph Engine (Web Audio API & HTML5 Audio)
 * Minimalist CD & Tone-Arm Pin interactive player.
 * Putting the Pin on the disc plays the Abbey Nocturne with authentic vinyl needle SFX;
 * taking the Pin off the disc lifts the needle and pauses playback.
 */

class GothicSoundscape {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.nodes = {};
    this.volumes = {
      master: 0.8,
      nocturne: 0.75
    };

    // Sacred Abbey Playlist (Vinyl Discs)
    this.playlist = [
      {
        id: "opus1",
        title: "Opus I: Abbey Nocturne",
        discLabel: "OPUS I • NOCTURNE",
        src: "/static/assets/ambient-nocturne.mp3",
        desc: "Piano & Strings Nocturne"
      },
      {
        id: "opus2",
        title: "Opus II: Gothic Vespers",
        discLabel: "OPUS II • VESPERS",
        src: "/static/assets/ambient-vespers.mp3",
        desc: "Sanctuary Bells & Choral Chant"
      }
    ];
    this.currentTrackIndex = 0;

    // Abbey Nocturne Audio Element
    this.phonographAudio = new Audio(this.playlist[0].src);
    this.phonographAudio.loop = false;
    this.phonographAudio.preload = "auto";
    this.isPhonographPlaying = false;
    this.isPlaying = false; // Compatibility flag
    this.phonographSpeed = 1.0;
    this.hasPhonographCrackle = true;
    this.phonographSource = null;
    this.phonographGain = null;
    this.onPhonographStateChange = null;
    this.onPhonographTimeUpdate = null;
    this.onTrackChange = null;

    this.setupAudioElementEvents();
  }

  setupAudioElementEvents() {
    this.phonographAudio.addEventListener("timeupdate", () => {
      if (this.onPhonographTimeUpdate && this.phonographAudio.duration) {
        this.onPhonographTimeUpdate(
          this.phonographAudio.currentTime,
          this.phonographAudio.duration
        );
      }
    });

    this.phonographAudio.addEventListener("ended", () => {
      // Advance to next opus in the sacred list
      this.nextTrack(true);
    });

    this.phonographAudio.addEventListener("pause", () => {
      if (this.isPhonographPlaying) {
        this.isPhonographPlaying = false;
        this.isPlaying = false;
        if (this.onPhonographStateChange) this.onPhonographStateChange(false);
      }
    });
  }

  getCurrentTrack() {
    return this.playlist[this.currentTrackIndex];
  }

  setTrack(index, autoPlay = null) {
    if (index < 0 || index >= this.playlist.length) return;
    const shouldPlay = autoPlay !== null ? autoPlay : this.isPhonographPlaying;

    if (this.isPhonographPlaying) {
      this.pausePhonograph();
    }

    this.currentTrackIndex = index;
    const track = this.playlist[index];
    this.phonographAudio.src = track.src;

    if (this.onTrackChange) {
      this.onTrackChange(track, index);
    }

    if (shouldPlay) {
      setTimeout(() => {
        this.playPhonograph();
      }, 150);
    }
  }

  nextTrack(autoPlay = null) {
    const nextIdx = (this.currentTrackIndex + 1) % this.playlist.length;
    this.setTrack(nextIdx, autoPlay);
  }

  prevTrack(autoPlay = null) {
    const prevIdx = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.setTrack(prevIdx, autoPlay);
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // --- Procedural Vinyl Needle Drop Landing Thud & Contact Click ---
  playNeedleDropSfx() {
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    const now = this.ctx.currentTime;

    try {
      // 1. Stylus contact click (tiny highpass click)
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(1400, now);
      clickOsc.frequency.exponentialRampToValueAtTime(180, now + 0.02);
      clickGain.gain.setValueAtTime(0.22, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain || this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.03);

      // 2. Low-frequency stylus touchdown thud (sub-bass landing thump)
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = "sine";
      thudOsc.frequency.setValueAtTime(110, now + 0.003);
      thudOsc.frequency.exponentialRampToValueAtTime(42, now + 0.08);
      thudGain.gain.setValueAtTime(0.32, now + 0.003);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain || this.ctx.destination);
      thudOsc.start(now + 0.003);
      thudOsc.stop(now + 0.1);
    } catch (e) {}
  }

  // --- Procedural Tone-Arm Lift Click ---
  playNeedleLiftSfx() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.03);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // --- Procedural Subtle Vinyl Surface Dust & Crackle ---
  setupPhonographCrackle() {
    if (!this.ctx || this.nodes.crackleSrc) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        if (Math.random() > 0.9992) {
          output[i] = (Math.random() * 2 - 1) * 0.35;
        } else if (Math.random() > 0.985) {
          output[i] = (Math.random() * 2 - 1) * 0.03;
        } else {
          output[i] = 0;
        }
      }

      const crackleSrc = this.ctx.createBufferSource();
      crackleSrc.buffer = noiseBuffer;
      crackleSrc.loop = true;

      const crackleFilter = this.ctx.createBiquadFilter();
      crackleFilter.type = "bandpass";
      crackleFilter.frequency.value = 1750;
      crackleFilter.Q.value = 2.0;

      const crackleGain = this.ctx.createGain();
      const targetVol = this.hasPhonographCrackle && this.isPhonographPlaying ? 0.08 : 0.0001;
      crackleGain.gain.setValueAtTime(targetVol, this.ctx.currentTime);

      crackleSrc.connect(crackleFilter);
      crackleFilter.connect(crackleGain);

      if (this.masterGain) {
        crackleGain.connect(this.masterGain);
      } else {
        crackleGain.connect(this.ctx.destination);
      }

      crackleSrc.start();
      this.nodes.crackleSrc = crackleSrc;
      this.nodes.crackleGain = crackleGain;
    } catch (e) {}
  }

  // --- Put Pin on Disc (Play Nocturne) ---
  playPhonograph() {
    this.initContext();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    // Play tactile needle touchdown sound
    this.playNeedleDropSfx();

    // Start crackle if enabled
    if (this.hasPhonographCrackle) {
      this.setupPhonographCrackle();
      if (this.nodes.crackleGain && this.ctx) {
        this.nodes.crackleGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
      }
    }

    const vol = Math.max(0, Math.min(1.0, this.volumes.nocturne * this.volumes.master));
    this.phonographAudio.volume = vol;
    this.phonographAudio.playbackRate = this.phonographSpeed || 1.0;

    this.isPhonographPlaying = true;
    this.isPlaying = true;
    if (this.onPhonographStateChange) this.onPhonographStateChange(true);

    const playPromise = this.phonographAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("Direct play error:", err);
        this.isPhonographPlaying = false;
        this.isPlaying = false;
        if (this.onPhonographStateChange) this.onPhonographStateChange(false);
      });
    }
  }

  // --- Take Pin off Disc (Turn Off / Pause Nocturne) ---
  pausePhonograph() {
    this.playNeedleLiftSfx();

    if (this.nodes.crackleGain && this.ctx) {
      this.nodes.crackleGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
    }

    this.phonographAudio.pause();
    this.isPhonographPlaying = false;
    this.isPlaying = false;
    if (this.onPhonographStateChange) this.onPhonographStateChange(false);
  }

  // --- Master Toggle: Put Pin On / Take Pin Off ---
  togglePhonograph() {
    if (this.isPhonographPlaying) {
      this.pausePhonograph();
    } else {
      this.playPhonograph();
    }
  }

  setPhonographSpeed(rate) {
    this.phonographSpeed = parseFloat(rate) || 1.0;
    if (this.phonographAudio) {
      this.phonographAudio.playbackRate = this.phonographSpeed;
    }
  }

  setPhonographCrackle(enabled) {
    this.hasPhonographCrackle = !!enabled;
    if (this.nodes.crackleGain && this.ctx) {
      const target = this.hasPhonographCrackle && this.isPhonographPlaying ? 0.08 : 0.0001;
      this.nodes.crackleGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
    }
  }

  // --- Gradual Decrescendo Fadeout ---
  fadeToSilence(durationSeconds = 120, onComplete = null) {
    if (!this.isPhonographPlaying) {
      if (onComplete) onComplete();
      return;
    }

    const startVol = this.phonographAudio.volume;
    const steps = 30;
    const stepInterval = (durationSeconds * 1000) / steps;
    let stepCount = 0;

    const fadeInterval = setInterval(() => {
      stepCount++;
      const currentVol = Math.max(0, startVol * (1 - stepCount / steps));
      this.phonographAudio.volume = currentVol;

      if (this.nodes.crackleGain && this.ctx) {
        this.nodes.crackleGain.gain.setValueAtTime(Math.max(0.0001, 0.08 * (1 - stepCount / steps)), this.ctx.currentTime);
      }

      if (stepCount >= steps) {
        clearInterval(fadeInterval);
        this.pausePhonograph();
        this.phonographAudio.volume = startVol; // Reset for next time
        if (onComplete) onComplete();
      }
    }, stepInterval);
  }

  // --- Compatibility Stubs ---
  start() {
    this.playPhonograph();
  }

  stop() {
    this.pausePhonograph();
  }

  setChannelVolume(channel, val) {
    if (channel === "master" || channel === "nocturne") {
      this.volumes[channel] = parseFloat(val);
      const vol = Math.max(0, Math.min(1.0, this.volumes.nocturne * this.volumes.master));
      this.phonographAudio.volume = vol;
    }
  }

  applySoundPreset() {
    return null;
  }

  setBinauralBeat() {
    return null;
  }
}

window.gothicSoundscape = new GothicSoundscape();
