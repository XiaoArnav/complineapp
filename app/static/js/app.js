/**
 * Compline: Classical Gothic Wind-Down Companion
 * Main UI Controller, Scribe Ink Streaming, Abbey Phonograph, Grimoire & Settings
 */

document.addEventListener("DOMContentLoaded", () => {
  // UI Elements
  const tomeTitle = document.getElementById("tomeTitle");
  const tomeBody = document.getElementById("tomeBody");
  const tomeMeta = document.getElementById("tomeMeta");
  const modelStatus = document.getElementById("modelStatus");
  const btnSummon = document.getElementById("btnSummon");
  const btnSoundscape = document.getElementById("btnSoundscape");
  const moodInput = document.getElementById("moodInput");
  const runePills = document.querySelectorAll(".rune-pill");

  // Grimoire Elements
  const btnBookmark = document.getElementById("btnBookmark");
  const bookmarkIcon = document.getElementById("bookmarkIcon");
  const bookmarkLabel = document.getElementById("bookmarkLabel");
  const btnOpenGrimoire = document.getElementById("btnOpenGrimoire");
  const btnCloseGrimoire = document.getElementById("btnCloseGrimoire");
  const btnGrimoireDone = document.getElementById("btnGrimoireDone");
  const grimoireModal = document.getElementById("grimoireModal");
  const grimoireList = document.getElementById("grimoireList");
  const grimoireCountBadge = document.getElementById("grimoireCountBadge");

  // Universal Mobile Audio Unlock (iOS Safari & Chrome Android)
  function unlockAudioContexts() {
    if (window.gothicSoundscape && window.gothicSoundscape.ctx && window.gothicSoundscape.ctx.state === "suspended") {
      window.gothicSoundscape.ctx.resume();
    }
    if (window.candleSound && window.candleSound.ctx && window.candleSound.ctx.state === "suspended") {
      window.candleSound.ctx.resume();
    }
  }
  document.addEventListener("touchstart", unlockAudioContexts, { passive: true, once: true });
  document.addEventListener("click", unlockAudioContexts, { once: true });

  // Universal Airtight Text Selection Locker & Selection Cleaner
  const isTextInput = (el) => {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || el.isContentEditable;
  };

  // 1. Prevent selectstart on capture phase everywhere outside inputs
  document.addEventListener("selectstart", (e) => {
    if (!isTextInput(e.target)) {
      e.preventDefault();
      if (window.getSelection) window.getSelection().removeAllRanges();
      return false;
    }
  }, true);

  // 2. Prevent dragstart text selection
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

  // 4. Prevent double-click & triple-click text selection anywhere outside inputs
  document.addEventListener("mousedown", (e) => {
    if (!isTextInput(e.target)) {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
      const isClickable = e.target.closest("button") || e.target.closest("a") ||
                          e.target.closest(".tarot-3d-card") || e.target.closest(".tarot-3d-stage") ||
                          e.target.closest(".phonograph-card") || e.target.closest(".rune-pill") ||
                          e.target.closest(".repertoire-card") || e.target.closest(".rose-window-wrapper");
      if (e.detail > 1 && !isClickable) {
        e.preventDefault();
      }
    }
  }, true);

  document.addEventListener("dblclick", (e) => {
    if (!isTextInput(e.target)) {
      const isClickable = e.target.closest("button") || e.target.closest("a") ||
                          e.target.closest(".tarot-3d-card") || e.target.closest(".tarot-3d-stage") ||
                          e.target.closest(".phonograph-card") || e.target.closest(".rune-pill") ||
                          e.target.closest(".repertoire-card") || e.target.closest(".rose-window-wrapper");
      if (!isClickable) {
        e.preventDefault();
      }
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    }
  }, true);

  // Settings Elements
  const btnOpenSettings = document.getElementById("btnOpenSettings");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const settingsModal = document.getElementById("settingsModal");
  const btnSaveSettings = document.getElementById("btnSaveSettings");
  const settingModel = document.getElementById("settingModel");
  const settingForceOffline = document.getElementById("settingForceOffline");
  const settingPhonographSpeed = document.getElementById("settingPhonographSpeed");
  const settingDefaultCrackle = document.getElementById("settingDefaultCrackle");

  // Abbey Phonograph Elements (Only CD & Pin)
  const phonographCard = document.getElementById("phonographCard");
  const phonographStatusBadge = document.getElementById("phonographStatusBadge");
  const turntablePlatter = document.getElementById("turntablePlatter");
  const vinylRecord = document.getElementById("vinylRecord");
  const toneArmAssembly = document.getElementById("toneArmAssembly");
  const btnPinToggle = document.getElementById("btnPinToggle");
  const pinBtnIcon = document.getElementById("pinBtnIcon");
  const pinBtnLabel = document.getElementById("pinBtnLabel");

  // State
  let currentStoryText = "";
  let currentParagraphs = [];

  // --- 1. Settings & Persistence ---
  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem("compline_settings")) || {
        model: "gemma2:2b",
        force_offline: false,
        phonograph_speed: 1.0,
        phonograph_crackle: true
      };
    } catch (e) {
      return {
        model: "gemma2:2b",
        force_offline: false,
        phonograph_speed: 1.0,
        phonograph_crackle: true
      };
    }
  }

  function applySettings(settings) {
    if (settingModel) settingModel.value = settings.model || "gemma2:2b";
    if (settingForceOffline) settingForceOffline.checked = !!settings.force_offline;
    if (settingPhonographSpeed) settingPhonographSpeed.value = String(settings.phonograph_speed || 1.0);
    if (settingDefaultCrackle) settingDefaultCrackle.checked = settings.phonograph_crackle !== false;

    if (window.gothicSoundscape) {
      window.gothicSoundscape.setPhonographSpeed(settings.phonograph_speed || 1.0);
      window.gothicSoundscape.setPhonographCrackle(settings.phonograph_crackle !== false);
    }
  }

  // Initialize settings on startup
  applySettings(getSettings());

  btnOpenSettings.addEventListener("click", () => {
    applySettings(getSettings());
    openModal(settingsModal);
  });
  btnCloseSettings.addEventListener("click", () => closeModal(settingsModal));

  const btnReplayIntro = document.getElementById("btnReplayIntro");
  if (btnReplayIntro) {
    btnReplayIntro.addEventListener("click", () => {
      closeModal(settingsModal);
      if (window.candleIntro) {
        window.candleIntro.restart();
      }
    });
  }

  btnSaveSettings.addEventListener("click", () => {
    const newSettings = {
      model: settingModel.value,
      force_offline: settingForceOffline.checked,
      phonograph_speed: parseFloat(settingPhonographSpeed.value) || 1.0,
      phonograph_crackle: settingDefaultCrackle.checked
    };
    localStorage.setItem("compline_settings", JSON.stringify(newSettings));
    applySettings(newSettings);
    closeModal(settingsModal);
    showToast("Reliquary Settings Sealed ✠");
  });

  // --- 2. Initial Status Check ---
  fetchStatus();

  async function fetchStatus() {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      const settings = getSettings();

      if (settings.force_offline || settings.model === "offline_procedural") {
        modelStatus.innerHTML = `<span class="dot" style="background:#d4af37;box-shadow:0 0 6px #d4af37;"></span> Offline Scriptorium Engine (Forced)`;
      } else if (data.ollama && data.ollama.available) {
        const model = settings.model || (data.ollama.has_gemma ? data.ollama.gemma_models[0] : (data.ollama.models[0] || "Ollama"));
        modelStatus.innerHTML = `<span class="dot"></span> Local Gemma Active (${model})`;
      } else {
        modelStatus.innerHTML = `<span class="dot" style="background:#d4af37;box-shadow:0 0 6px #d4af37;"></span> Offline Monastic Engine (Ready)`;
      }
    } catch (e) {
      modelStatus.innerHTML = `<span class="dot" style="background:#d4af37;"></span> Offline Scriptorium Active`;
    }
  }

  // --- 3. 📜 Scribe Ink Streaming (Live Typing) ---
  async function streamStory(promptText = "sloth in cathedral") {
    btnSummon.disabled = true;
    btnSummon.innerHTML = "🕯️ Inscribing Live Upon Vellum...";
    tomeBody.style.opacity = "1";
    tomeBody.innerHTML = "";

    const settings = getSettings();
    const model = settings.model !== "offline_procedural" ? settings.model : null;
    const forceOffline = settings.force_offline || (settings.model === "offline_procedural");

    // Dynamic Scribe paragraph container and cursor
    let paragraphCount = 0;
    let currentP = null;
    let cursor = document.createElement("span");
    cursor.className = "scribe-cursor";

    function startNewParagraph() {
      currentP = document.createElement("p");
      currentP.id = `para-${paragraphCount}`;
      paragraphCount++;
      tomeBody.appendChild(currentP);
      currentP.appendChild(cursor);
    }

    startNewParagraph();
    let accumulatedText = "";
    let isFirstLetter = true;
    let wordChunkCount = 0;

    try {
      const response = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          model: model,
          force_offline: forceOffline
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream response failed, falling back to standard generate.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // keep remainder

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const ev = JSON.parse(jsonStr);
            if (ev.type === "start") {
              tomeTitle.textContent = ev.title;
              tomeMeta.textContent = ev.open_source_note || "Classical Gothic Hypnagogic Tale";
            } else if (ev.type === "chunk") {
              const text = ev.text;
              accumulatedText += text;

              if (text === "\n\n" || text.includes("\n\n")) {
                startNewParagraph();
              } else {
                // Drop Capital on very first letter
                if (isFirstLetter && text.trim().length > 0) {
                  isFirstLetter = false;
                  const firstChar = text.charAt(0);
                  const dropCapSpan = document.createElement("span");
                  dropCapSpan.className = "drop-cap ink-word";
                  dropCapSpan.textContent = firstChar;
                  currentP.insertBefore(dropCapSpan, cursor);

                  const rest = text.slice(1);
                  if (rest) {
                    const span = document.createElement("span");
                    span.className = "ink-word";
                    span.textContent = rest;
                    currentP.insertBefore(span, cursor);
                  }
                } else {
                  const span = document.createElement("span");
                  span.className = "ink-word";
                  span.textContent = text;
                  currentP.insertBefore(span, cursor);

                  wordChunkCount++;
                  if (wordChunkCount % 4 === 0 && window.candleSound) {
                    window.candleSound.playQuillScratch();
                  }
                  if (wordChunkCount % 8 === 0) {
                    cursor.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }
                }
              }
            } else if (ev.type === "done") {
              currentStoryText = ev.full_story || accumulatedText;
            }
          } catch (e) {
            console.warn("SSE json parse error", e);
          }
        }
      }

      // Remove scribe cursor when completed
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);

      currentStoryText = currentStoryText || accumulatedText;
      currentParagraphs = currentStoryText.split("\n\n").filter(p => p.trim().length > 0);

      // Update Grimoire bookmark button
      updateBookmarkBtnState();

    } catch (err) {
      console.warn("Live ink stream error, falling back to one-shot generator:", err);
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      await generateStoryFallback(promptText);
    } finally {
      btnSummon.disabled = false;
      btnSummon.innerHTML = "🦥 Drift Into Slumber (New Chapter)";
    }
  }

  // Fallback generator if stream drops
  async function generateStoryFallback(promptText = "sloth in cathedral") {
    tomeBody.style.opacity = "0.5";
    try {
      const settings = getSettings();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          model: settings.model !== "offline_procedural" ? settings.model : null,
          force_offline: settings.force_offline || (settings.model === "offline_procedural")
        })
      });
      const data = await response.json();
      currentStoryText = data.story;
      tomeTitle.textContent = data.title;
      tomeMeta.textContent = data.open_source_note || "Classical Gothic Hypnagogic Tale";
      renderFormattedStory(data.story);
      updateBookmarkBtnState();
    } catch (err) {
      tomeBody.innerHTML = "<p>The candlelight flickers, but the scribe's ink remains calm. Try once more.</p>";
    } finally {
      tomeBody.style.opacity = "1";
    }
  }

  function renderFormattedStory(rawStory) {
    tomeBody.innerHTML = "";
    currentParagraphs = rawStory.split("\n\n").filter(p => p.trim().length > 0);

    currentParagraphs.forEach((para, idx) => {
      const pElem = document.createElement("p");
      pElem.id = `para-${idx}`;
      
      if (idx === 0) {
        const firstLetter = para.charAt(0);
        const restOfFirst = para.slice(1);
        pElem.innerHTML = `<span class="drop-cap">${firstLetter}</span>${restOfFirst}`;
      } else {
        pElem.textContent = para;
      }
      tomeBody.appendChild(pElem);
    });
  }

  // --- 4. 📖 Scriptorium Grimoire (Saved Chapters) ---
  function getGrimoire() {
    try {
      return JSON.parse(localStorage.getItem("compline_grimoire")) || [];
    } catch (e) {
      return [];
    }
  }

  function saveGrimoire(list) {
    localStorage.setItem("compline_grimoire", JSON.stringify(list));
    updateGrimoireBadge();
  }

  function updateGrimoireBadge() {
    const list = getGrimoire();
    if (grimoireCountBadge) {
      grimoireCountBadge.textContent = list.length;
    }
  }

  function isCurrentStoryBookmarked() {
    if (!currentStoryText) return false;
    const list = getGrimoire();
    return list.some(item => item.title === tomeTitle.textContent || item.story === currentStoryText);
  }

  function updateBookmarkBtnState() {
    if (!btnBookmark) return;
    if (isCurrentStoryBookmarked()) {
      btnBookmark.classList.add("bookmarked");
      bookmarkIcon.textContent = "⭐";
      bookmarkLabel.textContent = "Inscribed in Grimoire";
    } else {
      btnBookmark.classList.remove("bookmarked");
      bookmarkIcon.textContent = "🔖";
      bookmarkLabel.textContent = "Inscribe in Grimoire";
    }
  }

  btnBookmark.addEventListener("click", () => {
    if (!currentStoryText) return;
    const list = getGrimoire();
    const existingIndex = list.findIndex(item => item.title === tomeTitle.textContent || item.story === currentStoryText);

    if (existingIndex >= 0) {
      // Remove bookmark
      list.splice(existingIndex, 1);
      saveGrimoire(list);
      updateBookmarkBtnState();
      showToast("Chapter removed from Grimoire ✠");
    } else {
      // Inscribe new chapter
      const excerpt = currentStoryText.slice(0, 140).replace(/\n+/g, " ") + "…";
      const newEntry = {
        id: "chap_" + Date.now(),
        title: tomeTitle.textContent || "Gothic Nocturne",
        meta: tomeMeta.textContent || "Classical Gothic Tale",
        date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        excerpt: excerpt,
        story: currentStoryText
      };
      list.unshift(newEntry);
      saveGrimoire(list);
      updateBookmarkBtnState();
      showToast("Chapter Inscribed in Grimoire ✠");
    }
  });

  function renderGrimoireList() {
    const list = getGrimoire();
    grimoireList.innerHTML = "";

    if (list.length === 0) {
      grimoireList.innerHTML = `
        <div class="grimoire-empty">
          <div class="grimoire-empty-icon">📖</div>
          <p>Your grimoire holds no inscribed chapters yet.</p>
          <p style="font-size:13px;margin-top:6px;color:var(--text-dim);margin-bottom:16px;">
            Summon a nocturnal tale and click “Inscribe in Grimoire” to preserve it for future slumbers.
          </p>
          <button id="btnLoadStarterGrimoire" class="btn-gothic" style="font-size:12px;padding:6px 16px;">
            ✨ Inscribe Ancient Cloister Starter Tales
          </button>
        </div>
      `;
      const starterBtn = document.getElementById("btnLoadStarterGrimoire");
      if (starterBtn) {
        starterBtn.addEventListener("click", () => {
          const starterChapters = [
            {
              id: "chap_silo",
              title: "The Sloth of the Cloister Rafters",
              meta: "Chapter I • Hypnagogic Decrescendo",
              date: "Ancient Canon",
              excerpt: "High above the stone flagstones of Saint Jerome’s Abbey, among the vaulted oak rafters where the dust of centuries rests undisturbed, dwells Brother Silo…",
              story: "High above the stone flagstones of Saint Jerome’s Abbey, among the vaulted oak rafters where the dust of centuries rests undisturbed, dwells Brother Silo. He is not a monk of parchment and ink, but an ancient, woolly sloth who found solace in the warmth of the high clerestory centuries ago. Below, the Gregorian murmurs have long faded into the amber dusk, leaving only the sound of gentle, rhythmic rain washing against the lancet windows.\n\nBrother Silo does not hurry. He understands the profound theology of stillness. Slowly, with deliberate, languid grace, he curls his long claws around the seasoned cedar beam. The night air carries the cool fragrance of damp moss and wild elderberry from the quadrangle garden below.\n\nA single beeswax candle flickers on the altar far below, its flame dancing softly in the draft before settling into a warm, steady golden glow. Shadows of stone saints stretch long across the limestone walls, protective and quiet. The whole cathedral breathes with a deep, slow rhythm.\n\nThe rain taps a lullaby against the stained glass, each drop singing of sleep, of release, of letting the heavy world go. Silo closes his dark, glistening eyes, burying his chin into his thick, moss-tinted fur. The ancient abbey holds you safely within its walls.\n\nListen to the rain. There is nothing to decide tonight. There is nothing to finish. Breathe in the cool stone air, breathe out the day’s weight, and rest."
            },
            {
              id: "chap_rain",
              title: "Rainfall Upon the Stained Glass Rose",
              meta: "Chapter II • Calming Jewel Tones",
              date: "Autumn Vigil",
              excerpt: "In the highest tower of the forgotten scriptorium, midnight arrives without a sound. A vast rose window looks out across the misty valleys…",
              story: "In the highest tower of the forgotten scriptorium, midnight arrives without a sound. A vast rose window of ruby, sapphire, and amethyst glass looks out across the misty valleys of the northern moors. Against this intricate mandala of lead and jewel, a soft, relentless autumn rain begins to fall.\n\nEach droplet strikes the stained glass with a hushed crystalline chime, weeping slowly down the crimson robes of glass angels. Inside the stone chamber, a brazier of sweet sandalwood and dried lavender smolders gently, sending delicate curls of lilac smoke toward the rib-vaulted ceiling.\n\nOn the massive oak reading desk lies a heavy parchment tome bound in dark velvet. The blackletter script, inked by lanterns long extinguished, speaks only of quiet rivers and stars that drift across eternal skies. You do not need to read the words; their presence alone is an anchor of peace.\n\nOutside, the wind is merely a soothing breath sighing through the stone gargoyles' throats. The room is warm, enclosed by ten-foot walls of granite that have kept the frantic outside world at bay for seven hundred years.\n\nLet your thoughts dissolve like ink in deep well water. The glass glows faintly with moonlight. The rain continues its steady, comforting drum. Close your eyes, and surrender to the silence."
            }
          ];
          saveGrimoire(starterChapters);
          renderGrimoireList();
          updateBookmarkBtnState();
          showToast("Ancient Cloister Tales Inscribed ✠");
        });
      }
      return;
    }

    list.forEach(item => {
      const card = document.createElement("div");
      card.className = "grimoire-card";
      card.innerHTML = `
        <div class="grimoire-card-title">${item.title}</div>
        <div class="grimoire-card-meta">
          <span>🕯️ ${item.date}</span>
          <span>•</span>
          <span>${item.meta}</span>
        </div>
        <div class="grimoire-card-excerpt">“${item.excerpt}”</div>
        <div class="grimoire-card-actions">
          <button class="btn-grimoire-action btn-grimoire-read" data-id="${item.id}">📖 Inscribe</button>
          <button class="btn-grimoire-action btn-grimoire-erase" data-id="${item.id}">🗑️ Erase</button>
        </div>
      `;
      grimoireList.appendChild(card);
    });

    // Wire actions
    grimoireList.querySelectorAll(".btn-grimoire-read").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const entry = getGrimoire().find(c => c.id === id);
        if (entry) {
          tomeTitle.textContent = entry.title;
          tomeMeta.textContent = entry.meta;
          currentStoryText = entry.story;
          renderFormattedStory(entry.story);
          updateBookmarkBtnState();
          closeModal(grimoireModal);
          showToast(`“${entry.title}” opened upon the Tome ✠`);
        }
      });
    });

    grimoireList.querySelectorAll(".btn-grimoire-erase").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        let cur = getGrimoire();
        cur = cur.filter(c => c.id !== id);
        saveGrimoire(cur);
        renderGrimoireList();
        updateBookmarkBtnState();
        showToast("Chapter erased from Grimoire");
      });
    });
  }

  btnOpenGrimoire.addEventListener("click", () => {
    renderGrimoireList();
    openModal(grimoireModal);
  });
  btnCloseGrimoire.addEventListener("click", () => closeModal(grimoireModal));
  btnGrimoireDone.addEventListener("click", () => closeModal(grimoireModal));

  // Initialize Grimoire Badge
  updateGrimoireBadge();

  // --- 5. 📻 The Abbey Phonograph — Authentic Inward Pin Motion & Disc Groove Seeking ---
  const PHONO_REST_ANGLE = 0.0;
  const PHONO_OUTER_GROOVE_ANGLE = 21.0;
  const PHONO_INNER_GROOVE_ANGLE = 35.5;
  const PHONO_GROOVE_SPAN = PHONO_INNER_GROOVE_ANGLE - PHONO_OUTER_GROOVE_ANGLE; // 14.5 deg

  let isPhonoDraggingTonearm = false;
  let isPhonoDraggingPlatter = false;
  let phonoRafId = null;

  function formatPhonoTime(sec) {
    if (isNaN(sec) || sec < 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function applyPhonographProgress(currentTime, duration, isPlaying) {
    const toneArm = document.getElementById("toneArmAssembly");
    const trackingRing = document.getElementById("grooveTrackingRing");
    const timeCurrent = document.getElementById("phonoTimeCurrent");
    const timeTotal = document.getElementById("phonoTimeTotal");
    const grooveFill = document.getElementById("grooveTrackFill");
    const groovePinhead = document.getElementById("grooveTrackPinhead");

    const validDur = duration && !isNaN(duration) && duration > 0 ? duration : 180;
    const p = Math.max(0, Math.min(1.0, (currentTime || 0) / validDur));

    // 1. Move Pin towards inside as the song plays on and on
    if (toneArm && !isPhonoDraggingTonearm && !isPhonoDraggingPlatter) {
      if (isPlaying) {
        const baseAngle = PHONO_OUTER_GROOVE_ANGLE + p * PHONO_GROOVE_SPAN;
        // Subtle microscopic tactile vinyl groove vibration
        const jitter = Math.sin(Date.now() * 0.007) * 0.14;
        const liveAngle = (baseAngle + jitter).toFixed(2);
        toneArm.style.setProperty("--pin-angle", `${liveAngle}deg`);
      } else {
        // If not playing, keep at rest cradle unless paused mid-song
        const state = window.gothicSoundscape ? window.gothicSoundscape.isPhonographPlaying : false;
        if (!state && (!currentTime || currentTime === 0)) {
          toneArm.style.setProperty("--pin-angle", `${PHONO_REST_ANGLE}deg`);
        }
      }
    }

    // 2. Dynamic tracking ring on the vinyl record (shrinks inward beneath stylus)
    if (trackingRing && !isPhonoDraggingPlatter) {
      const ringDiameter = 142 - p * (142 - 64);
      trackingRing.style.width = `${ringDiameter.toFixed(1)}px`;
      trackingRing.style.height = `${ringDiameter.toFixed(1)}px`;
      trackingRing.classList.toggle("visible", isPlaying);
    }

    // 3. Real-time time & groove slider readout
    if (timeCurrent) timeCurrent.textContent = formatPhonoTime(currentTime || 0);
    if (timeTotal && duration && !isNaN(duration)) timeTotal.textContent = formatPhonoTime(duration);
    if (grooveFill) grooveFill.style.width = `${(p * 100).toFixed(1)}%`;
    if (groovePinhead) groovePinhead.style.left = `${(p * 100).toFixed(1)}%`;

    if (phonographStatusBadge && isPlaying && !isPhonoDraggingTonearm && !isPhonoDraggingPlatter) {
      phonographStatusBadge.textContent = `Pin On Disc • ${formatPhonoTime(currentTime || 0)} / ${formatPhonoTime(validDur)}`;
    }
  }

  function runPhonographTrackingLoop() {
    if (window.gothicSoundscape && window.gothicSoundscape.isPhonographPlaying) {
      const audio = window.gothicSoundscape.phonographAudio;
      if (audio && audio.duration && !isNaN(audio.duration)) {
        applyPhonographProgress(audio.currentTime, audio.duration, true);
      }
    }
    phonoRafId = requestAnimationFrame(runPhonographTrackingLoop);
  }

  function updatePhonographUI(isPlaying) {
    if (!phonographCard) return;
    const toneArm = document.getElementById("toneArmAssembly");
    const vinylRec = document.getElementById("vinylRecord");
    const pinBtn = document.getElementById("btnPinToggle");
    const pinIcon = document.getElementById("pinBtnIcon");
    const pinLabel = document.getElementById("pinBtnLabel");

    const currentTrack = window.gothicSoundscape ? window.gothicSoundscape.getCurrentTrack() : null;
    const trackShortTitle = currentTrack ? currentTrack.title : "Nocturne";
    const curIdx = window.gothicSoundscape ? window.gothicSoundscape.currentTrackIndex : 0;

    // Update Repertoire Cards & Stepper Badges dynamically
    const repCards = document.querySelectorAll(".repertoire-card");
    const stepperDisplay = document.getElementById("trackStepperDisplay");
    const totalTracks = window.gothicSoundscape ? window.gothicSoundscape.playlist.length : 3;
    const romanNumerals = ["OPUS I", "OPUS II", "OPUS III", "OPUS IV", "OPUS V"];

    repCards.forEach((c, idx) => {
      const isCardActive = (idx === curIdx);
      c.classList.toggle("active", isCardActive);
      c.setAttribute("aria-selected", isCardActive ? "true" : "false");

      const badge = c.querySelector(".rep-active-indicator");
      if (badge) {
        badge.textContent = isCardActive ? (isPlaying ? "PLAYING" : "ON PLATTER") : "IN SLEEVE";
      }
    });

    if (stepperDisplay) {
      const roman = romanNumerals[curIdx] || `OPUS ${curIdx + 1}`;
      stepperDisplay.textContent = `${roman} • ${curIdx + 1} OF ${totalTracks}`;
    }

    if (isPlaying) {
      phonographCard.classList.add("playing");
      if (vinylRec) vinylRec.classList.add("spinning");
      if (toneArm) toneArm.classList.add("pin-on-disc");
      if (pinBtn) {
        pinBtn.classList.add("active");
        if (pinIcon) pinIcon.textContent = "⏸";
        if (pinLabel) pinLabel.textContent = "Take Pin Off Disc (Turn Off)";
      }
      if (phonographStatusBadge) {
        phonographStatusBadge.classList.add("playing");
      }
      if (btnSoundscape) {
        btnSoundscape.innerHTML = "<span>⏸</span> Abbey Phonograph (Take Pin Off)";
        btnSoundscape.classList.add("active");
      }

      // Start continuous 60fps needle glide tracking loop
      if (!phonoRafId) {
        phonoRafId = requestAnimationFrame(runPhonographTrackingLoop);
      }
    } else {
      phonographCard.classList.remove("playing");
      if (vinylRec) vinylRec.classList.remove("spinning");
      if (toneArm) {
        toneArm.classList.remove("pin-on-disc");
        // Return to cradle
        toneArm.style.setProperty("--pin-angle", `${PHONO_REST_ANGLE}deg`);
      }
      if (pinBtn) {
        pinBtn.classList.remove("active");
        if (pinIcon) pinIcon.textContent = "📍";
        if (pinLabel) pinLabel.textContent = `Put Pin on Disc (Play ${trackShortTitle})`;
      }
      if (phonographStatusBadge) {
        phonographStatusBadge.textContent = "Pin Off Disc";
        phonographStatusBadge.classList.remove("playing");
      }
      if (btnSoundscape) {
        btnSoundscape.innerHTML = "<span>📻</span> Abbey Phonograph (Put Pin on Disc)";
        btnSoundscape.classList.remove("active");
      }

      if (phonoRafId) {
        cancelAnimationFrame(phonoRafId);
        phonoRafId = null;
      }
      // Reset tracker visual
      const trackingRing = document.getElementById("grooveTrackingRing");
      if (trackingRing) trackingRing.classList.remove("visible");
    }
  }

  function setupPhonographController() {
    if (!window.gothicSoundscape) return;

    const toneArm = document.getElementById("toneArmAssembly");
    const platter = document.getElementById("turntablePlatter");
    const vinylRec = document.getElementById("vinylRecord");
    const stage = document.getElementById("phonographStage");
    const pinBtn = document.getElementById("btnPinToggle");
    const statusBadge = document.getElementById("phonographStatusBadge");
    const scrubTooltip = document.getElementById("phonographScrubTooltip");
    const trackingRing = document.getElementById("grooveTrackingRing");
    const grooveSlider = document.getElementById("grooveTrackSlider");

    let tooltipTimer = null;
    function showTooltip(text, x = null, y = null) {
      if (!scrubTooltip) return;
      if (tooltipTimer) clearTimeout(tooltipTimer);
      scrubTooltip.textContent = text;
      scrubTooltip.classList.add("visible");
      if (x != null && y != null && stage) {
        const stageRect = stage.getBoundingClientRect();
        const relX = Math.max(50, Math.min(stageRect.width - 50, x - stageRect.left));
        scrubTooltip.style.left = `${relX}px`;
      } else {
        scrubTooltip.style.left = "50%";
      }
    }

    function hideTooltip(delay = 0) {
      if (!scrubTooltip) return;
      if (tooltipTimer) clearTimeout(tooltipTimer);
      if (delay > 0) {
        tooltipTimer = setTimeout(() => {
          scrubTooltip.classList.remove("visible");
        }, delay);
      } else {
        scrubTooltip.classList.remove("visible");
      }
    }

    // Sacred Repertoire Cards & Stepper Bar
    const repCards = document.querySelectorAll(".repertoire-card");
    const stepperDisplay = document.getElementById("trackStepperDisplay");
    const btnPrev = document.getElementById("btnPrevTrack");
    const btnNext = document.getElementById("btnNextTrack");

    function selectTrackByIndex(idx, autoPlay = true) {
      unlockAudioContexts();
      if (window.gothicSoundscape) {
        window.gothicSoundscape.setTrack(idx, autoPlay);
      }
    }

    repCards.forEach(card => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const trackIdx = parseInt(card.dataset.track, 10);
        selectTrackByIndex(trackIdx, true);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const trackIdx = parseInt(card.dataset.track, 10);
          selectTrackByIndex(trackIdx, true);
        }
      });
    });

    if (btnPrev) {
      btnPrev.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        unlockAudioContexts();
        if (window.gothicSoundscape) window.gothicSoundscape.prevTrack(true);
      });
    }

    if (btnNext) {
      btnNext.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        unlockAudioContexts();
        if (window.gothicSoundscape) window.gothicSoundscape.nextTrack(true);
      });
    }

    // Keyboard shortcuts: Shift+Left / Shift+Right for song switching
    document.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        unlockAudioContexts();
        if (window.gothicSoundscape) window.gothicSoundscape.prevTrack(true);
      } else if (e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        unlockAudioContexts();
        if (window.gothicSoundscape) window.gothicSoundscape.nextTrack(true);
      }
    });

    // Backwards compatibility for any legacy .track-tab elements
    const trackTabs = document.querySelectorAll(".track-tab");
    trackTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const trackIdx = parseInt(tab.dataset.track, 10);
        selectTrackByIndex(trackIdx, true);
      });
    });

    window.gothicSoundscape.onTrackChange = (track, index) => {
      trackTabs.forEach((tab, i) => {
        tab.classList.toggle("active", i === index);
      });
      const recordLabelSub = document.getElementById("recordLabelSub");
      if (recordLabelSub) recordLabelSub.textContent = track.discLabel;
      updatePhonographUI(window.gothicSoundscape.isPhonographPlaying);
    };

    // Listen for state changes from audio engine
    window.gothicSoundscape.onPhonographStateChange = (isPlaying) => {
      updatePhonographUI(isPlaying);
    };

    // Listen for time updates from audio element
    window.gothicSoundscape.onPhonographTimeUpdate = (currentTime, duration) => {
      applyPhonographProgress(currentTime, duration, window.gothicSoundscape.isPhonographPlaying);
    };

    // ── 1. REALISTIC VINYL DISC GROOVE SEEKING (Click or Drag anywhere on Disk) ──
    function getProgressFromPlatterCoords(clientX, clientY) {
      if (!vinylRec) return 0;
      const rect = vinylRec.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);

      const outerR = rect.width * 0.46; // ~71px
      const innerR = rect.width * 0.20; // ~31px (edge of center label)

      // Outside outer groove -> beginning (p = 0.0)
      // Inside inner groove (near label) -> end (p = 1.0)
      let p = (outerR - dist) / (outerR - innerR);
      return {
        ratio: Math.max(0, Math.min(1.0, p)),
        distance: dist,
        isCenterLabel: dist < innerR
      };
    }

    if (platter) {
      platter.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        unlockAudioContexts();

        const { ratio, isCenterLabel } = getProgressFromPlatterCoords(e.clientX, e.clientY);

        // Clicking center label toggles play/pause
        if (isCenterLabel) {
          if (window.gothicSoundscape) window.gothicSoundscape.togglePhonograph();
          return;
        }

        isPhonoDraggingPlatter = true;
        try { platter.setPointerCapture(e.pointerId); } catch (_) {}

        const dur = window.gothicSoundscape ? window.gothicSoundscape.phonographAudio.duration || 180 : 180;
        const targetSec = ratio * dur;

        // Preview needle position and illuminated tracking ring
        const previewAngle = PHONO_OUTER_GROOVE_ANGLE + ratio * PHONO_GROOVE_SPAN;
        if (toneArm) toneArm.style.setProperty("--pin-angle", `${previewAngle.toFixed(2)}deg`);

        if (trackingRing) {
          const ringSize = 142 - ratio * (142 - 64);
          trackingRing.style.width = `${ringSize.toFixed(1)}px`;
          trackingRing.style.height = `${ringSize.toFixed(1)}px`;
          trackingRing.classList.add("visible");
        }

        showTooltip(`📍 Groove ${Math.round(ratio * 100)}% • ${formatPhonoTime(targetSec)} / ${formatPhonoTime(dur)}`, e.clientX, e.clientY);
      });

      platter.addEventListener("pointermove", (e) => {
        if (!isPhonoDraggingPlatter) return;
        e.preventDefault();

        const { ratio } = getProgressFromPlatterCoords(e.clientX, e.clientY);
        const dur = window.gothicSoundscape ? window.gothicSoundscape.phonographAudio.duration || 180 : 180;
        const targetSec = ratio * dur;

        const previewAngle = PHONO_OUTER_GROOVE_ANGLE + ratio * PHONO_GROOVE_SPAN;
        if (toneArm) toneArm.style.setProperty("--pin-angle", `${previewAngle.toFixed(2)}deg`);

        if (trackingRing) {
          const ringSize = 142 - ratio * (142 - 64);
          trackingRing.style.width = `${ringSize.toFixed(1)}px`;
          trackingRing.style.height = `${ringSize.toFixed(1)}px`;
        }

        showTooltip(`📍 Seek Groove ${Math.round(ratio * 100)}% • ${formatPhonoTime(targetSec)} / ${formatPhonoTime(dur)}`, e.clientX, e.clientY);
      });

      const finishPlatterSeek = (e) => {
        if (!isPhonoDraggingPlatter) return;
        isPhonoDraggingPlatter = false;
        try { platter.releasePointerCapture(e.pointerId); } catch (_) {}

        const { ratio, isCenterLabel } = getProgressFromPlatterCoords(e.clientX, e.clientY);
        if (isCenterLabel) {
          hideTooltip();
          return;
        }

        const dur = window.gothicSoundscape ? window.gothicSoundscape.phonographAudio.duration || 180 : 180;
        const targetSec = ratio * dur;

        // Inscribe needle and seek playback to that exact minute/second
        if (window.gothicSoundscape) {
          window.gothicSoundscape.seekPhonographRatio(ratio, true);
        }

        showTooltip(`✠ Inscribed: ${formatPhonoTime(targetSec)} / ${formatPhonoTime(dur)}`, e.clientX, e.clientY);
        hideTooltip(1400);
      };

      platter.addEventListener("pointerup", finishPlatterSeek);
      platter.addEventListener("pointercancel", () => {
        isPhonoDraggingPlatter = false;
        hideTooltip();
      });
    }

    // ── 2. REALISTIC PHYSICAL TONE-ARM (PIN) DRAGGING ACROSS DISK ──
    if (toneArm) {
      let armDragAngle = 0;

      toneArm.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        unlockAudioContexts();

        isPhonoDraggingTonearm = true;
        toneArm.classList.add("dragging");
        try { toneArm.setPointerCapture(e.pointerId); } catch (_) {}

        showTooltip("📍 Moving Pin — Drop anywhere on Disc Grooves", e.clientX, e.clientY);
      });

      toneArm.addEventListener("pointermove", (e) => {
        if (!isPhonoDraggingTonearm) return;
        e.preventDefault();

        const armRect = toneArm.getBoundingClientRect();
        // Pivot point at top: 16px, left: 27px inside toneArm
        const pivotX = armRect.left + 27;
        const pivotY = armRect.top + 16;
        const dx = e.clientX - pivotX;
        const dy = e.clientY - pivotY;

        // Angle relative to vertical (clockwise rotation is towards the left/disc)
        const rawAngle = -Math.atan2(dx, dy) * (180 / Math.PI);
        const clampedAngle = Math.max(0, Math.min(37.5, rawAngle));
        armDragAngle = clampedAngle;

        toneArm.style.setProperty("--pin-angle", `${clampedAngle.toFixed(2)}deg`);

        const dur = window.gothicSoundscape ? window.gothicSoundscape.phonographAudio.duration || 180 : 180;

        if (clampedAngle < 13.5) {
          showTooltip("📍 Pin on Rest Cradle (Release to Turn Off)", e.clientX, e.clientY);
          if (trackingRing) trackingRing.classList.remove("visible");
        } else {
          const p = Math.max(0, Math.min(1.0, (clampedAngle - PHONO_OUTER_GROOVE_ANGLE) / PHONO_GROOVE_SPAN));
          const seekSec = p * dur;

          if (trackingRing) {
            const ringSize = 142 - p * (142 - 64);
            trackingRing.style.width = `${ringSize.toFixed(1)}px`;
            trackingRing.style.height = `${ringSize.toFixed(1)}px`;
            trackingRing.classList.add("visible");
          }

          showTooltip(`📍 Drop Pin: ${formatPhonoTime(seekSec)} / ${formatPhonoTime(dur)} (Groove ${Math.round(p * 100)}%)`, e.clientX, e.clientY);
        }
      });

      const finishTonearmDrag = (e) => {
        if (!isPhonoDraggingTonearm) return;
        isPhonoDraggingTonearm = false;
        toneArm.classList.remove("dragging");
        try { toneArm.releasePointerCapture(e.pointerId); } catch (_) {}

        if (armDragAngle < 13.5) {
          // Parked on cradle -> Pause / Turn off
          if (window.gothicSoundscape) {
            window.gothicSoundscape.pausePhonograph();
          }
          toneArm.style.setProperty("--pin-angle", `${PHONO_REST_ANGLE}deg`);
          showTooltip("📍 Pin Off Disc", e.clientX, e.clientY);
          hideTooltip(1000);
        } else {
          // Dropped on disc -> Play from this groove position!
          const p = Math.max(0, Math.min(1.0, (armDragAngle - PHONO_OUTER_GROOVE_ANGLE) / PHONO_GROOVE_SPAN));
          const dur = window.gothicSoundscape ? window.gothicSoundscape.phonographAudio.duration || 180 : 180;
          const targetSec = p * dur;

          if (window.gothicSoundscape) {
            window.gothicSoundscape.seekPhonographRatio(p, true);
          }

          showTooltip(`✠ Pin Inscribed at ${formatPhonoTime(targetSec)}`, e.clientX, e.clientY);
          hideTooltip(1400);
        }
      };

      toneArm.addEventListener("pointerup", finishTonearmDrag);
      toneArm.addEventListener("pointercancel", () => {
        isPhonoDraggingTonearm = false;
        toneArm.classList.remove("dragging");
        hideTooltip();
      });
    }

    // ── 3. GROOVE BAR TRACK SLIDER SCRUBBING ──
    if (grooveSlider) {
      let isSliderDragging = false;
      function seekFromSlider(e) {
        const rect = grooveSlider.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
        const dur = window.gothicSoundscape ? window.gothicSoundscape.phonographAudio.duration || 180 : 180;
        if (window.gothicSoundscape) {
          window.gothicSoundscape.seekPhonographRatio(ratio, true);
        }
        showTooltip(`📍 Groove ${Math.round(ratio * 100)}% • ${formatPhonoTime(ratio * dur)}`);
        hideTooltip(1200);
      }

      grooveSlider.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        unlockAudioContexts();
        isSliderDragging = true;
        try { grooveSlider.setPointerCapture(e.pointerId); } catch (_) {}
        seekFromSlider(e);
      });

      grooveSlider.addEventListener("pointermove", (e) => {
        if (!isSliderDragging) return;
        seekFromSlider(e);
      });

      grooveSlider.addEventListener("pointerup", (e) => {
        if (!isSliderDragging) return;
        isSliderDragging = false;
        try { grooveSlider.releasePointerCapture(e.pointerId); } catch (_) {}
      });
    }

    // ── 4. MASTER BUTTON & STATUS BADGE CONTROLS ──
    if (pinBtn) {
      pinBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        unlockAudioContexts();
        if (window.gothicSoundscape) {
          window.gothicSoundscape.togglePhonograph();
        }
      });
    }

    if (statusBadge) {
      statusBadge.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        unlockAudioContexts();
        if (window.gothicSoundscape) {
          window.gothicSoundscape.togglePhonograph();
        }
      });
    }
  }

  // --- 6. 📻 Tome Reading Bar Phonograph Button ---
  function toggleSoundscape() {
    unlockAudioContexts();
    if (window.gothicSoundscape) {
      window.gothicSoundscape.togglePhonograph();
    }
  }

  // --- 7. Quick Mood Rune Pills ---
  runePills.forEach(pill => {
    pill.addEventListener("click", () => {
      runePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const mood = pill.dataset.mood;
      moodInput.value = mood;
      streamStory(mood);
    });
  });

  moodInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      streamStory(moodInput.value);
    }
  });

  btnSummon.addEventListener("click", () => {
    streamStory(moodInput.value || "sloth");
  });

  btnSoundscape.addEventListener("click", toggleSoundscape);

  // --- 8. Modal Helpers & Toast ---
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("active");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("active");
  }

  [grimoireModal, settingsModal].forEach(modal => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  let toastTimeout = null;
  function showToast(msg) {
    const toast = document.getElementById("gothicToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // --- 9. Celestial Astrolabe HUD & Constellation Finder ---
  const btnToggleStellarHUD = document.getElementById("btnToggleStellarHUD");
  const stellarPopover = document.getElementById("stellarPopover");
  const selectConstellation = document.getElementById("selectConstellation");
  const chkConstellations = document.getElementById("chkConstellations");
  const chkAstrolabeRings = document.getElementById("chkAstrolabeRings");
  const chkAutoDrift = document.getElementById("chkAutoDrift");
  const btnResetPolaris = document.getElementById("btnResetPolaris");

  if (btnToggleStellarHUD && stellarPopover) {
    btnToggleStellarHUD.addEventListener("click", (e) => {
      e.stopPropagation();
      stellarPopover.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!stellarPopover.contains(e.target) && e.target !== btnToggleStellarHUD) {
        stellarPopover.classList.remove("active");
      }
    });

    if (selectConstellation) {
      selectConstellation.addEventListener("change", () => {
        const val = selectConstellation.value;
        if (val && window.stellarMap) {
          const ok = window.stellarMap.glideToConstellation(val);
          if (ok) {
            showToast(`Astrolabe Gliding to ${val} ✠`);
          }
        }
      });
    }

    document.querySelectorAll(".zodiac-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        const constell = chip.getAttribute("data-constell");
        if (constell && window.stellarMap) {
          if (selectConstellation) selectConstellation.value = constell;
          const ok = window.stellarMap.glideToConstellation(constell);
          if (ok) {
            showToast(`Astrolabe Gliding to ${constell} ✠`);
          }
        }
      });
    });

    document.querySelectorAll(".planet-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        const planet = chip.getAttribute("data-planet");
        if (planet && window.stellarMap) {
          if (selectConstellation) selectConstellation.value = `planet_${planet}`;
          const ok = window.stellarMap.glideToConstellation(`planet_${planet}`);
          if (ok) {
            showToast(`Astrolabe Gliding to Planet ${planet} ✠`);
          }
        }
      });
    });

    const chkPlanets = document.getElementById("chkPlanets");
    if (chkPlanets) {
      chkPlanets.addEventListener("change", () => {
        if (window.stellarMap) window.stellarMap.showPlanets = chkPlanets.checked;
      });
    }

    if (chkConstellations) {
      chkConstellations.addEventListener("change", () => {
        if (window.stellarMap) window.stellarMap.showConstellations = chkConstellations.checked;
      });
    }

    if (chkAstrolabeRings) {
      chkAstrolabeRings.addEventListener("change", () => {
        if (window.stellarMap) window.stellarMap.showAstrolabeRings = chkAstrolabeRings.checked;
      });
    }

    if (chkAutoDrift) {
      chkAutoDrift.addEventListener("change", () => {
        if (window.stellarMap) window.stellarMap.autoDrift = chkAutoDrift.checked;
      });
    }

    const btnAlignTonightSky = document.getElementById("btnAlignTonightSky");
    const btnAlignTonightSkyHeader = document.getElementById("btnAlignTonightSkyHeader");
    const btnAlignTonightSkySettings = document.getElementById("btnAlignTonightSkySettings");
    const tonightSkyHeaderLabel = document.getElementById("tonightSkyHeaderLabel");
    const realSkyStatusPill = document.getElementById("realSkyStatusPill");

    const performRealSkyAlignment = () => {
      if (!window.stellarMap) return;

      const onCoordsResolved = (lat, lon, isGps = false) => {
        const res = window.stellarMap.alignToTonightSky(lat, lon);
        if (res) {
          const sign = res.latDeg >= 0 ? "+" : "";
          const latStr = `${sign}${res.latDeg.toFixed(1)}°`;
          const methodStr = isGps ? "GPS" : "Timezone";
          if (tonightSkyHeaderLabel) {
            tonightSkyHeaderLabel.innerHTML = `Overhead (${latStr})`;
          }
          if (realSkyStatusPill) {
            realSkyStatusPill.textContent = `ALIGNED • LAT ${latStr}`;
            realSkyStatusPill.style.color = "#76ff94";
          }
          showToast(`Astrolabe Aligned to Real Sky • Lat ${latStr} (${methodStr}) ✠`);
        }
      };

      if (navigator.geolocation) {
        showToast("Querying Celestial Coordinates & Geolocation... ✠");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            onCoordsResolved(pos.coords.latitude, pos.coords.longitude, true);
          },
          () => {
            // Graceful fallback to timezone-derived coordinates
            onCoordsResolved(null, null, false);
          },
          { timeout: 4000, enableHighAccuracy: false }
        );
      } else {
        onCoordsResolved(null, null, false);
      }
    };

    if (btnAlignTonightSky) {
      btnAlignTonightSky.addEventListener("click", performRealSkyAlignment);
    }
    if (btnAlignTonightSkyHeader) {
      btnAlignTonightSkyHeader.addEventListener("click", performRealSkyAlignment);
    }
    if (btnAlignTonightSkySettings) {
      btnAlignTonightSkySettings.addEventListener("click", () => {
        performRealSkyAlignment();
        const settingsModal = document.getElementById("settingsModal");
        if (settingsModal) settingsModal.classList.remove("active");
      });
    }

    if (btnResetPolaris) {
      btnResetPolaris.addEventListener("click", () => {
        if (window.stellarMap) window.stellarMap.resetToPolaris();
        if (selectConstellation) selectConstellation.value = "Ursa Minor";
        showToast("Celestial View Aligned with Polaris ✠");
      });
    }
  }

  // --- 10. Initial Phonograph & Story Load ---
  setupPhonographController();

  // Stream the introductory nocturnal chapter
  streamStory("sloth in cathedral");
});
