# 🦇 Compline: Product Requirements Document (PRD)

**Project:** Compline — Classical Gothic Bedside Wind-Down Companion  
**Theme:** "Slow and Steady" (Hacktoberfest Week 3 & DEV Challenge)  
**Version:** 1.0.0  
**Target Platform:** Modern Web (Desktop & Mobile, PWA Offline Ready)  
**Author:** XiaoArnav  
**Status:** In Production ([complineapp.vercel.app](https://complineapp.vercel.app))

---

## 1. Executive Summary & Product Vision

### 1.1 Vision
Modern digital sleep aids are riddled with hyperactive dopamine loops: push notifications, account barriers, credit card paywalls, and high-contrast blue-light screens that stimulate the prefrontal cortex instead of calming it. 

**Compline** is a sanctuary of low cognitive load. Inspired by the ancient monastic night prayer service (*Completorium*), Compline combines Classical Gothic romanticism with tactile physical rituals:
- Lighting a candle with an authentic match strike.
- Dropping a phonograph ruby stylus onto a spinning shellac record.
- Aligning a 3D celestial astrolabe with the stars overhead.
- Spinning a mechanical wheel of fortune to draw a sleepy tarot archetype.
- Listening to gentle, rhythmic, hypnagogic bedtime tales where illuminated ink dries in real time on damp parchment.

Compline requires **no logins, no payments, no tracking, and zero internet connectivity**—functioning fully in airplane mode with open-weight Google **Gemma 2** running locally.

---

## 2. Target Audience & User Personas

### Persona A: The Restless Night Scroller ("Brother Thomas", 28)
* **Demographics:** Software engineer / desk worker with insomnia.
* **Habit:** Finds himself mindlessly scrolling social media or reading technical docs at 1:00 AM, unable to transition into sleep.
* **Need:** A calming ritual with zero cognitive demand that replaces dopamine-heavy feeds with slow sensory decrescendo.

### Persona B: The Dark Academia / Gothic Romantic ("Sister Elena", 24)
* **Demographics:** Student / creative writer enchanted by medieval architecture, antique bookbinding, and vinyl audio.
* **Need:** An aesthetic sanctuary that avoids generic sterile wellness designs, offering tactile Victorian phonographs, Latinate runes, and candlelit stone crypts.

### Persona C: The Privacy-Conscious Traveler ("The Pilgrim", 35)
* **Demographics:** Frequent flyer and open-source enthusiast.
* **Need:** Bedside companion that runs 100% offline on a laptop or mobile browser in Airplane Mode, with open-weight local AI (Ollama/Gemma) and zero telemetry.

---

## 3. Problem Statement & Core Value Proposition

| Traditional Sleep Apps (Calm / Headspace) | Compline Sleep Sanctuary |
| :--- | :--- |
| Mandatory account registration & recurring \$70/yr subscriptions | **100% Free & Open-Source** (MIT License) |
| High cognitive overhead (menus, streaks, badges, gamification) | **Single-Screen Sanctuary**; all rituals accessible in 1 click |
| Requires continuous high-speed Wi-Fi & cloud telemetry | **100% Offline-First**; runs on Python standard library |
| Proprietary closed-source cloud AI | **Open-Weight Gemma 2** running locally via Ollama |
| Modern flat corporate UI | **Classical Gothic Chiaroscuro** (obsidian, antique gold, velvet) |

---

## 4. Key Functional Requirements

### 4.1 Scriptorium Hypnagogic Story Engine
* **Hypnagogic Decrescendo Architecture:** Stories begin with gentle sensory atmospheric scene-setting, then progressively slow down sentence length, vocabulary complexity, and cadence toward silence.
* **Drop-Cap Typographic Ink Stream:** Stories stream token-by-token or word-by-word with an illuminated monastic drop-cap on the first letter, accompanied by subtle quill scratching audio.
* **Open-Weight Gemma 2 Integration:** Connects automatically to local Ollama instances (`http://localhost:11434`) running `gemma2:2b` or `gemma2:9b`.
* **Procedural Offline Scriptorium Engine:** When running offline without Ollama, procedural algorithmic templates provide infinite seed-varied classical gothic tales without external network calls.
* **Save to Grimoire:** Users can bookmark favorite tales directly to the browser's persistent `localStorage`.

### 4.2 The Abbey Phonograph (Tactile Turntable & Tonearm Mechanics)
* **Physical Inward Needle Motion:** As the audio plays, the tonearm ruby stylus glides continuously from the outer groove rim (`21.0°` at `00:00`) inward across concentric micro-grooves to the inner run-out groove (`35.5°` at track completion).
* **Interactive Groove Seeking (Needle Dropping):**
  - **Click/Drag on Disc:** Touching any concentric groove calculates the radial distance from the spindle ($r$) and instantly seeks playback to that exact minute and second.
  - **Drag Tonearm Directly:** Grabbing the tonearm lets the user swing the needle over the record with a live HUD tooltip showing timestamp and groove percentage. Dropping the pin onto the disc settles into that second; dropping it onto the cradle parks and pauses.
* **Web Audio Procedural Sound Effects:**
  - Dynamic stylus touchdown contact click (highpass triangle wave).
  - Sub-bass landing thump (exponential decay sine wave).
  - Continuous vintage dust & shellac surface crackle filter.
* **Sacred Repertoire (Opus Catalog):**
  - *Opus I: Abbey Nocturne* (Piano & Strings)
  - *Opus II: Gothic Vespers* (Sanctuary Bells & Choral Chant)
  - *Opus III: White Night / Morpheus* (Hypnagogic Chants & Moonlight)

### 4.3 3D Celestial Astrolabe & Real Sky Alignment
* **Interactive 3D Celestial Sphere:** Three.js starfield rendering 89 classical constellations, 7 wandering planets, and coordinate meridian rings.
* **Astronomical "Tonight's Real Sky":** Calculates Greenwich Mean Sidereal Time (GMST) and Local Sidereal Time (LST) from the user's latitude/longitude coordinates to rotate the virtual sky into exact astronomical alignment with the physical heavens outside.
* **Decrescendo Star Drift:** Subtle inertial damping and ambient cosmic rotation.

### 4.4 The Wheel of Fate & Gothic Slumber Tarot
* **Mechanical Physics Engine:** Synchronized 60 FPS `requestAnimationFrame` physics loop with rotational angular momentum, friction dampening ($0.988$), and physical ratchet collision clicks.
* **Slumber Tarot Archetypes:** 8 bespoke gothic cards (The Sloth, The Cloister, The Candle, The Moon, The Gargoyle, The Hourglass, The Vespers, The Crypt) designed to resolve evening overthinking into tranquil archetype meditations.

### 4.5 Candle Awakening Ritual & Sanctuary Blackout Mode
* **Ignition Ritual:** Cinematic match-strike animation lighting the central beeswax candle.
* **Living Flame Physics:** Randomized micro-drafts, amber light aura pulses, and soft wax drip animations.
* **Tap-to-Extinguish Blackout Mode:** One-tap extinction of the flame fades all UI chrome to pure obsidian, allowing dark ambient night-light listening.

---

## 5. Non-Functional Requirements (NFRs)

| Category | Requirement | Verification Method |
| :--- | :--- | :--- |
| **Dependencies** | Zero external pip dependencies; runs on Python standard library (`http.server`, `urllib`, `json`) | `pip list` in isolated virtualenv |
| **Offline Capability** | 100% functionality without internet connection in airplane mode | Disconnect Wi-Fi; test all features |
| **Performance** | Constant 60 FPS animation loop for Tarot Wheel and Phonograph Needle | Chrome DevTools Performance Audit |
| **Serverless Latency** | SSE story stream finishes in $< 6\text{s}$ on Vercel without connection hang | Vercel Function logs & `curl` audit |
| **Privacy** | 0 tracking cookies, 0 external analytics scripts, 0 third-party pixels | Network panel inspection |
| **Accessibility & Eye Strain** | Strict chiaroscuro palette: background luminance $< 0.05$, zero blue-light spikes | WCAG Contrast & Color Checker |

---

## 6. Release & Version Milestones

- **v1.0 (Initial Sanctuary):** Candle ritual, Gemma 2 prompt engineering, local Ollama connectivity.
- **v2.0 (Astrolabe & Soundscapes):** Three.js 3D celestial sphere, Abbey Phonograph player, ambient audio loop.
- **v3.0 (Wheel of Fate):** Mechanical tarot wheel physics, ratchet audio synthesis, 8 slumber cards.
- **v3.4 (Tactile Realism & Cloud Hardening):** Inward tonearm gliding, interactive groove scrub/seek, single-request Vercel serverless lifecycle eliminating timeouts.
