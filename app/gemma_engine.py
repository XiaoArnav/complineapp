"""
Gemma Story Engine for Compline (Nocturne of the Sloth)
Specialized for low-cognitive-load, hypnagogic Gothic sleep tales.
Supports local Ollama (Gemma 2), OpenAI-compatible local endpoints, and an offline procedural fallback.
"""

import os
import json
import random
import time
import urllib.request
import urllib.error

# System prompt engineered specifically for hypnagogic sleep induction:
# Slow cadence, low tension, rhythmic sensory detail, progressive decrescendo.
GOTHIC_HYPNAGOGIC_SYSTEM_PROMPT = """You are the Somnolent Scribe of an ancient candlelit abbey.
Your only purpose is to lull the listener into a deep, tranquil, dreamless slumber.
You craft tales imbued with Classical Gothic atmosphere: pointed medieval stone arches, rain trickling down stained glass rose windows, flickering beeswax candles, ancient parchment manuscripts, and moss-draped cloisters.

Strict rules for sleep induction:
1. Low Cognitive Load: Avoid complex plots, conflict, suspense, danger, or sudden twists.
2. Sensory & Rhythmic: Focus on soothing sensory textures—the rhythm of steady rain, the scent of lavender and frankincense, the soft warmth of velvet blankets, the deep resonance of a distant bronze bell.
3. Decrescendo: Let the prose gradually slow down toward the end. Paragraphs should become more spaced, repetitive, peaceful, and quiet, like breath slowing down before sleep.
4. Tone: Classical Gothic romanticism, mysterious yet entirely safe, cozy, and serene.
5. Pacing: Write 4 to 6 gentle paragraphs. Begin with an illuminated drop-cap style opening. End with an invitation to close one's eyes and let the night take over.
"""

# Pre-crafted Gothic hypnagogic templates and rich lexical seeds for offline procedural mode
GOTHIC_CHAPTERS = [
    {
        "title": "The Sloth of the Cloister Rafters",
        "theme": "sloth",
        "story": (
            "High above the stone flagstones of Saint Jerome’s Abbey, among the vaulted oak rafters where the dust of centuries rests undisturbed, dwells Brother Silo. "
            "He is not a monk of parchment and ink, but an ancient, woolly sloth who found solace in the warmth of the high clerestory centuries ago. Below, the Gregorian murmurs have long faded into the amber dusk, leaving only the sound of gentle, rhythmic rain washing against the lancet windows.\n\n"
            "Brother Silo does not hurry. He understands the profound theology of stillness. Slowly, with deliberate, languid grace, he curls his long claws around the seasoned cedar beam. The night air carries the cool fragrance of damp moss and wild elderberry from the quadrangle garden below.\n\n"
            "A single beeswax candle flickers on the altar far below, its flame dancing softly in the draft before settling into a warm, steady golden glow. Shadows of stone saints stretch long across the limestone walls, protective and quiet. The whole cathedral breathes with a deep, slow rhythm.\n\n"
            "The rain taps a lullaby against the stained glass, each drop singing of sleep, of release, of letting the heavy world go. Silo closes his dark, glistening eyes, burying his chin into his thick, moss-tinted fur. The ancient abbey holds you safely within its walls.\n\n"
            "Listen to the rain. There is nothing to decide tonight. There is nothing to finish. Breathe in the cool stone air, breathe out the day’s weight, and rest."
        )
    },
    {
        "title": "Rainfall Upon the Stained Glass Rose",
        "theme": "rain",
        "story": (
            "In the highest tower of the forgotten scriptorium, midnight arrives without a sound. "
            "A vast rose window of ruby, sapphire, and amethyst glass looks out across the misty valleys of the northern moors. Against this intricate mandala of lead and jewel, a soft, relentless autumn rain begins to fall.\n\n"
            "Each droplet strikes the stained glass with a hushed crystalline chime, weeping slowly down the crimson robes of glass angels. Inside the stone chamber, a brazier of sweet sandalwood and dried lavender smolders gently, sending delicate curls of lilac smoke toward the rib-vaulted ceiling.\n\n"
            "On the massive oak reading desk lies a heavy parchment tome bound in dark velvet. The blackletter script, inked by lanterns long extinguished, speaks only of quiet rivers and stars that drift across eternal skies. You do not need to read the words; their presence alone is an anchor of peace.\n\n"
            "Outside, the wind is merely a soothing breath sighing through the stone gargoyles' throats. The room is warm, enclosed by ten-foot walls of granite that have kept the frantic outside world at bay for seven hundred years.\n\n"
            "Let your thoughts dissolve like ink in deep well water. The glass glows faintly with moonlight. The rain continues its steady, comforting drum. Close your eyes, and surrender to the silence."
        )
    },
    {
        "title": "The Scriptorium of the Quiet Stars",
        "theme": "stars",
        "story": (
            "Beneath the pointed arches of the abbey library, rows of cedar shelves rise into shadowed heights. "
            "The scent of ancient vellum, dried rose petals, and beeswax polish fills the still air. Through the tall gothic arches open to the night courtyard, a canopy of velvet black unfolds, strewn with diamond stars that burn with a cool, motionless light.\n\n"
            "A sleepy breeze enters the cloister, turning the crisp page of an open herbal. It rustles softly, like the whisper of dry leaves in an autumn orchard. In this sanctuary, time has ceased its forward march; it pools like clear mountain water in a stone font.\n\n"
            "You sink into a tall-backed chair of dark walnut, lined with deep plum velvet. Your hands rest on armrests carved with smooth ivy vines. Your eyelids grow heavy, heavier with each breath, drawn downward by the benevolent weight of midnight.\n\n"
            "Far off in the valley, a single church bell rings once, its deep bronze resonance lingering in the cool air, vibrating softly through the stone floor before slowly, completely fading into silence.\n\n"
            "The stars watch over the quiet abbey. The stone keeps you warm. Let every muscle loosen. The day is done. Rest now, in the stillness of the quiet stars."
        )
    },
    {
        "title": "The Hearth in the Gargoyle's Keep",
        "theme": "hearth",
        "story": (
            "Deep within the inner bailey of the mountain castle, a hearth of rough-hewn basalt crackles with low, steady embers. "
            "Logs of aged applewood and peat burn with a quiet, soothing murmur, releasing sparks that float upward into the dark stone chimney like fireflies adrift in a summer grove.\n\n"
            "Above the hearth sits a small stone gargoyle, carved with folded wings and a serene, drowsy smile. Rain trickles outside the narrow lancet slits, yet within this chamber the warmth is enveloping, like a heavy woolen blanket tucked snugly around your shoulders.\n\n"
            "A heavy tapestry of forest greens and midnight blues covers the stone walls, dampening every echo into a hush. The shadows dance gently across the floor in a slow, hypnotic waltz, swaying to the crackle of wood and the distant sigh of the wind.\n\n"
            "There is no urgency here, no tasks awaiting your attention, no demands upon your spirit. Only the patient stone, the ember's warmth, and the rhythm of your own calm breathing.\n\n"
            "Feel the tension melt from your shoulders down into the floor. The embers pulse with a sleepy red glow. Close your eyes, and drift into the peaceful dark."
        )
    },
    {
        "title": "The Abbot's Lavender Cellar",
        "theme": "herbarium",
        "story": (
            "Step down the winding spiral staircase of cool limestone, descending into the tranquil undercroft where the abbey's harvest sleeps. "
            "From the vaulted stone ribs hang hundreds of dried bundles of wild lavender, chamomile, sweet marjoram, and mountain mint, scenting the damp subterranean air with a drowsy, golden perfume.\n\n"
            "Small terracotta oil lamps illuminate the groined vaults with soft, pool-like circles of amber light. Outside, above the ground, the stormy world rages, but down here beneath four layers of solid stone, the tempest is reduced to a soft, rhythmic vibration that rocks the foundation like a cradle.\n\n"
            "A stone bench is prepared with thick lamb's wool cushions. As you recline upon it, the quiet descends like a veil of dark silk. The gentle aroma of lavender fills your lungs, coaxing your pulse into a slow, effortless tempo.\n\n"
            "Each breath draws you deeper into relaxation. The stone holds you safely. The scents soothe your mind. Sleep is near, welcoming and kind. Let go, and sleep."
        )
    }
]


def check_ollama_status(host="http://localhost:11434"):
    """Check if local Ollama is active and return available models."""
    try:
        req = urllib.request.Request(f"{host}/api/tags", headers={"User-Agent": "Compline/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                models = [m.get("name", "") for m in data.get("models", [])]
                # Look specifically for Gemma
                gemma_models = [m for m in models if "gemma" in m.lower()]
                return {
                    "available": True,
                    "host": host,
                    "models": models,
                    "has_gemma": len(gemma_models) > 0,
                    "gemma_models": gemma_models
                }
    except Exception:
        pass
    return {"available": False, "host": host, "models": [], "has_gemma": False, "gemma_models": []}


def generate_with_ollama(prompt, model="gemma2:2b", host="http://localhost:11434"):
    """Generate hypnagogic Gothic story using local Ollama Gemma instance."""
    url = f"{host}/api/generate"
    payload = {
        "model": model,
        "system": GOTHIC_HYPNAGOGIC_SYSTEM_PROMPT,
        "prompt": (
            f"Craft a slow, peaceful, Classical Gothic bedtime story to help the listener fall asleep immediately. "
            f"The listener's chosen mood or focus is: '{prompt}'. "
            f"Remember: low cognitive load, repetitive calming rhythms, sensory Gothic details, safe and deeply comforting."
        ),
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 450
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Compline/1.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res.get("response", "").strip()


def stream_with_ollama(prompt, model="gemma2:2b", host="http://localhost:11434"):
    """Stream hypnagogic Gothic story using local Ollama Gemma instance token by token."""
    url = f"{host}/api/generate"
    payload = {
        "model": model,
        "system": GOTHIC_HYPNAGOGIC_SYSTEM_PROMPT,
        "prompt": (
            f"Craft a slow, peaceful, Classical Gothic bedtime story to help the listener fall asleep immediately. "
            f"The listener's chosen mood or focus is: '{prompt}'. "
            f"Remember: low cognitive load, repetitive calming rhythms, sensory Gothic details, safe and deeply comforting."
        ),
        "stream": True,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 450
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Compline/1.0"}
    )
    with urllib.request.urlopen(req, timeout=35) as resp:
        for raw_line in resp:
            line = raw_line.decode("utf-8").strip()
            if not line:
                continue
            try:
                chunk = json.loads(line)
                token = chunk.get("response", "")
                done = chunk.get("done", False)
                if token:
                    yield token
                if done:
                    break
            except Exception:
                continue


def stream_gothic_story(prompt="sloth in cathedral", preferred_model=None, force_offline=False):
    """
    Generator yielding SSE event dictionaries for live ink streaming:
    1. {"type": "start", "title": "...", "model": "...", "open_source_note": "..."}
    2. {"type": "chunk", "text": "..."}
    3. {"type": "done", "full_story": "..."}
    """
    cleaned_prompt = (prompt or "sloth").lower().strip()

    # 1. Try streaming from Ollama if available
    if not force_offline:
        status = check_ollama_status()
        if status["available"]:
            chosen_model = preferred_model
            if not chosen_model:
                if status["has_gemma"]:
                    chosen_model = status["gemma_models"][0]
                elif status["models"]:
                    chosen_model = status["models"][0]

            if chosen_model:
                try:
                    title_line = f"Gothic Nocturne: {cleaned_prompt.capitalize()}"
                    yield {
                        "type": "start",
                        "title": title_line,
                        "model": chosen_model,
                        "source": "ollama",
                        "open_source_note": f"Streamed live from local open-weight model: {chosen_model}"
                    }
                    accumulated = []
                    for token in stream_with_ollama(cleaned_prompt, model=chosen_model):
                        accumulated.append(token)
                        yield {"type": "chunk", "text": token}
                    full_text = "".join(accumulated).strip()
                    yield {"type": "done", "full_story": full_text}
                    return
                except Exception:
                    pass

    # 2. Procedural Gothic Scriptorium streaming
    matching = [c for c in GOTHIC_CHAPTERS if c["theme"] in cleaned_prompt]
    chosen = random.choice(matching) if matching else random.choice(GOTHIC_CHAPTERS)
    variations = [
        "Listen to the quiet pulse of the stone. Let your eyes soften and close.",
        "The ancient abbey shelters you from all hurry. Release your thoughts into the mist.",
        "The night is vast and peaceful. There is nothing more you need to do.",
        "Like the ancient gargoyles upon the parapet, surrender to the eternal calm."
    ]
    ending = random.choice(variations)
    full_story = f"{chosen['story']}\n\n{ending}"

    yield {
        "type": "start",
        "title": chosen["title"],
        "model": "Gemma Hypnagogic Template v2 (Offline)",
        "source": "procedural_gemma_engine",
        "open_source_note": "Inscribed live via offline Gothic Hypnagogic Engine (Scribe Ink Flow)"
    }

    # Stream paragraph by paragraph, word by word with natural monastic pacing
    paragraphs = full_story.split("\n\n")

    # In Serverless environments (Vercel / Lambda), pace swiftly (0.015s / 0.06s) so
    # the SSE stream completes comfortably in ~3 seconds and avoids serverless timeouts.
    is_serverless = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))
    base_delay = 0.015 if is_serverless else 0.055
    punct_delay = 0.06 if is_serverless else 0.26
    comma_delay = 0.035 if is_serverless else 0.14
    para_delay = 0.1 if is_serverless else 0.42

    for p_idx, para in enumerate(paragraphs):
        words = para.split(" ")
        for w_idx, word in enumerate(words):
            text_piece = word + (" " if w_idx < len(words) - 1 else "")
            yield {"type": "chunk", "text": text_piece}

            # Monastic scribe hypnagogic cadence: deliberate, meditative, relaxing
            delay = base_delay
            if word.endswith((".", "!", "?")):
                delay = punct_delay
            elif word.endswith((",", ";", ":", "—")):
                delay = comma_delay
            if delay > 0:
                time.sleep(delay)

        if p_idx < len(paragraphs) - 1:
            yield {"type": "chunk", "text": "\n\n"}
            if para_delay > 0:
                time.sleep(para_delay)

    yield {"type": "done", "full_story": full_story}


def generate_gothic_story(prompt="sloth in cathedral", preferred_model=None, force_offline=False):
    """
    Main story generation entry point:
    1. If Ollama is available with Gemma (or another model) and not force_offline, use local open-weight inference.
    2. Otherwise, use procedural hypnagogic story generator with customized seed variations.
    """
    cleaned_prompt = (prompt or "sloth").lower().strip()

    # 1. Try Ollama if not explicitly forced offline
    if not force_offline:
        status = check_ollama_status()
        if status["available"]:
            chosen_model = preferred_model
            if not chosen_model:
                if status["has_gemma"]:
                    chosen_model = status["gemma_models"][0]
                elif status["models"]:
                    chosen_model = status["models"][0]
            
            if chosen_model:
                try:
                    text = generate_with_ollama(cleaned_prompt, model=chosen_model)
                    if text and len(text) > 80:
                        title_line = f"Gothic Nocturne: {cleaned_prompt.capitalize()}"
                        return {
                            "source": "ollama",
                            "model": chosen_model,
                            "title": title_line,
                            "story": text,
                            "open_source_note": f"Generated locally using open-weight model: {chosen_model}"
                        }
                except Exception as e:
                    # Gracefully fall back to procedural
                    pass

    # 2. Procedural Gothic Sleep Engine (Guaranteed zero-dependency, works anywhere)
    matching_chapters = [c for c in GOTHIC_CHAPTERS if c["theme"] in cleaned_prompt]
    if matching_chapters:
        chosen = random.choice(matching_chapters)
    else:
        chosen = random.choice(GOTHIC_CHAPTERS)

    # Provide slight natural variations for bedtime repetition
    variations = [
        "Listen to the quiet pulse of the stone. Let your eyes soften and close.",
        "The ancient abbey shelters you from all hurry. Release your thoughts into the mist.",
        "The night is vast and peaceful. There is nothing more you need to do.",
        "Like the ancient gargoyles upon the parapet, surrender to the eternal calm."
    ]
    ending = random.choice(variations)
    full_story = f"{chosen['story']}\n\n{ending}"

    return {
        "source": "procedural_gemma_engine",
        "model": "Gemma Hypnagogic Template v2 (Offline)",
        "title": chosen["title"],
        "story": full_story,
        "open_source_note": "Rendered via local offline Gothic Hypnagogic Engine (Gemma-aligned slow-cadence templates)"
    }
