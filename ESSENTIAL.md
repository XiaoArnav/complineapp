# ⚡ Compline: The Essential Runbook & Cheatsheet (ESSENTIAL.md)

Quick-reference operational runbook, command cheatsheet, port map, keyboard shortcuts, Ollama setup, and troubleshooting guide for **Compline**.

---

## 1. 🚀 Quickstart Commands

### Local Server Launch
Compline runs entirely on standard Python 3.9+ with **zero external pip dependencies**:

```bash
# Clone the repository
git clone https://github.com/XiaoArnav/complineapp.git
cd complineapp

# Method 1: The Monastic Startup Shell Script
chmod +x run.sh && ./run.sh

# Method 2: Direct Python Server Daemon
python3 app/server.py
```
> **Local Portal:** [`http://localhost:7777`](http://localhost:7777)  
> **Production Live Site:** [`https://complineapp.vercel.app`](https://complineapp.vercel.app)

---

## 2. 🔌 Ports & Network Topology

| Port / Address | Service | Protocol | Notes |
| :--- | :--- | :--- | :--- |
| `localhost:7777` | Compline Python Server | HTTP/1.0 / 1.1 | Multi-threaded static & API daemon |
| `localhost:11434` | Local Ollama Engine | HTTP / JSON | Hosts open-weight Google Gemma 2 |
| `complineapp.vercel.app` | Vercel Serverless Edge | HTTP/2 (TLS 1.3) | Global cloud deployment |

---

## 3. 🤖 Local AI & Gemma 2 Setup

Compline automatically connects to local open-weight models if [Ollama](https://ollama.ai) is running:

### Step 1: Install & Pull Gemma 2
```bash
# Install Ollama (macOS / Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the lightweight 2B Gemma model (recommended for fast sleep stories)
ollama pull gemma2:2b

# Or pull the higher-fidelity 9B model
ollama pull gemma2:9b
```

### Step 2: Verify Ollama Health
```bash
# Check running models
ollama list

# Test direct model generation
curl -s http://localhost:11434/api/generate -d '{
  "model": "gemma2:2b",
  "prompt": "Write a slow bedtime sentence about a cathedral gargoyle.",
  "stream": false
}'
```

### Step 3: Check Compline's Ollama Bridge
```bash
# Test Compline's status detection
curl -s http://localhost:7777/api/status | grep "has_gemma"
```
* If Ollama is running, Compline streams live open-weight tokens from `gemma2:2b`.
* If Ollama is closed, Compline seamlessly falls back to the **Procedural Offline Gothic Engine** with zero errors.

---

## 4. ⌨️ Tactile Controls & Keyboard Shortcuts

| Action | Control / Shortcut | Description |
| :--- | :--- | :--- |
| **Put Pin on Disc / Take Off** | Click `#btnPinToggle` or Pin | Master play/pause toggle for Abbey Nocturne |
| **Next Opus Track** | `Shift + ArrowRight` | Advance through Repertoire (Opus I → II → III) |
| **Previous Opus Track** | `Shift + ArrowLeft` | Step back through Repertoire |
| **Seek to Minute / Second** | Click or Drag on Vinyl Disc | Touching outer rim = start; near center = end |
| **Physical Needle Scrubbing** | Drag `#toneArmAssembly` directly | Drag across disc to preview timestamp; drop to play |
| **Extinguish Candle (Blackout)** | Click flickering candle flame | Fades all UI to deep obsidian night-light mode |
| **Ignite Candle** | Click match or central wick | Cinematic match-strike audio and visual ritual |
| **Spin Wheel of Fate** | Click Tarot Wheel or "Spin Wheel" | 60 FPS physics spin with procedural ratchet audio |
| **Align Real Sky** | Click "Tonight's Real Sky" | Computes Local Sidereal Time from GPS zenith |

---

## 5. 🛠️ API Endpoint Cheatsheet

```bash
# 1. Health & Ollama Status Probe
curl -i http://localhost:7777/api/status

# 2. Synchronous Story Generation
curl -i -X POST http://localhost:7777/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "sloth in cathedral rafters"}'

# 3. Live Server-Sent Events (SSE) Story Stream
curl -N -X POST http://localhost:7777/api/generate/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "gentle rain on stained glass"}'
```

---

## 6. 🩺 Troubleshooting & Diagnostics

### Problem: Vercel Functions Timed Out After 300 Seconds
* **Cause:** `api/index.py` previously sent `Connection: keep-alive` without explicitly terminating `handle()`.
* **Fix Applied:** `handler.handle()` is overridden to enforce single-request execution (`self.close_connection = True`) and headers send `Connection: close`.
* **Verification:** Run `curl -i -X POST https://complineapp.vercel.app/api/generate/stream` — streams should complete cleanly in $< 6\text{s}$ with `HTTP/2 200`.

### Problem: No Audio Playing / Autoplay Blocked
* **Cause:** Modern browsers (Chrome, Safari) restrict audio autoplay before the first user gesture.
* **Fix:** Click anywhere on the sanctuary stage, light the candle, or tap **Put Pin on Disc**. Compline automatically calls `unlockAudioContexts()` on the first interaction.

### Problem: Port 7777 Already in Use
```bash
# Find and terminate existing local Compline server
lsof -i :7777
kill -9 $(lsof -t -i :7777)

# Restart daemon
python3 app/server.py
```

### Problem: Wheel or Phonograph Needle Not Moving
* **Cause:** Browser cache holding older JavaScript bundle.
* **Fix:** Hard refresh with `Cmd + Shift + R` (Mac) or `Ctrl + F5` (Windows/Linux). Assets use cache-busting version tags `?v=34.0`.

---

## 7. ✈️ 100% Airplane Mode (Zero-Wi-Fi Checklist)

To run Compline completely disconnected from the internet in an airplane cabin:

1. **Start Local Server:** `python3 app/server.py`
2. **Start Ollama (Optional):** `ollama serve`
3. **Open Browser:** `http://localhost:7777`
4. **Offline Guarantees:**
   - 0 pip packages needed.
   - 0 external CDN scripts (Three.js and fonts are stored locally in `app/static/`).
   - 0 external API calls (offline procedural engine activates automatically).
   - 0 tracking pixels or telemetry.
