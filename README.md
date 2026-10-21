# 🦇 Compline: Classical Gothic Wind-Down Companion

A candlelit gothic wind-down sanctuary designed for restful, low-cognitive-load sleep induction.

[![Live Demo](https://img.shields.io/badge/Demo-complineapp.vercel.app-72152b.svg)](https://complineapp.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Open-Weight Model](https://img.shields.io/badge/Model-Gemma_2-4a154b.svg)](https://ai.google.dev/gemma)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FXiaoArnav%2Fcomplineapp)

---

## 🏛️ Features

* **🌌 3D Celestial Astrolabe & Real Sky Alignment:** Orbit an interactive 3D starfield featuring 89 classical constellations and 7 wandering planets. Use **Tonight's Real Sky** to automatically compute local sidereal time from your GPS location and orient the celestial sphere overhead.
* **📻 The Abbey Phonograph:** Tactile vinyl player with realistic needle drop physics, vintage crackle filters, and ambient nocturnal choral, bell, and piano vespers.
* **🕯️ Candle Awakening Ritual:** Cinematic match-strike candle ignition ritual with tap-to-extinguish blackout mode.
* **📜 Scriptorium Story Generator:** Word-by-word hypnagogic bedtime tales streamed with illuminated drop-caps and a wet ink drying effect—powered by open-weight **Gemma 2** (via local Ollama) or offline procedural generation.
* **⚙️ Wheel of Fate & Gothic Tarot:** Mechanical wheel of fortune with procedural ratchet audio and an 8-card gothic slumber tarot deck.
* **📖 Scriptorium Grimoire:** Save and revisit favorite nocturnal tales with private local browser storage.

---

## 🔒 Privacy & Offline First

* **100% Airplane Mode Ready:** Runs fully offline with zero tracking, cookies, or external analytics.
* **Zero Telemetry or Accounts:** No subscriptions, ads, or logins.
* **Gentle Decrescendo:** Stories are crafted specifically for relaxation with gentle, tension-free narratives.

---

## 🚀 Quick Start

Compline runs on standard Python 3.9+ with **zero dependencies**:

```bash
# Clone the repository
git clone https://github.com/XiaoArnav/complineapp.git
cd complineapp

# Launch the Gothic Scriptorium
./run.sh
# or directly:
python3 app/server.py
```

Open **`http://localhost:7777`** in your browser.

### Optional: Local AI with Gemma 2

To use local AI generation via [Ollama](https://ollama.ai):

```bash
ollama run gemma2:2b
```

Compline automatically connects to `localhost:11434` when Ollama is running.

---

## 📜 License

Distributed under the [MIT License](LICENSE).
