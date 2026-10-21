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
      { name: "Polaris", constell: "Ursa Minor", ra: 0.659, dec: 1.558, mag: 1.98, color: "#fff0a8", label: "Stella Maris" },
      { name: "Kochab", constell: "Ursa Minor", ra: 3.883, dec: 1.294, mag: 2.08, color: "#ffd27a", label: "Guardian of the Pole" },
      { name: "Pherkad", constell: "Ursa Minor", ra: 4.014, dec: 1.254, mag: 3.05, color: "#f0f6ff" },
      { name: "Yildun", constell: "Ursa Minor", ra: 4.59, dec: 1.511, mag: 4.35, color: "#eef5ff" },
      { name: "Dubhe", constell: "Ursa Major", ra: 2.893, dec: 1.078, mag: 1.8, color: "#ffd27a", label: "Celestial Pointer" },
      { name: "Merak", constell: "Ursa Major", ra: 2.884, dec: 0.984, mag: 2.37, color: "#eef5ff", label: "Celestial Pointer" },
      { name: "Phecda", constell: "Ursa Major", ra: 3.111, dec: 0.937, mag: 2.44, color: "#eef5ff" },
      { name: "Megrez", constell: "Ursa Major", ra: 3.207, dec: 0.995, mag: 3.31, color: "#d8e8ff" },
      { name: "Alioth", constell: "Ursa Major", ra: 3.377, dec: 0.977, mag: 1.77, color: "#f0f6ff" },
      { name: "Mizar", constell: "Ursa Major", ra: 3.504, dec: 0.958, mag: 2.23, color: "#d2ecff", label: "Horse & Rider" },
      { name: "Alkaid", constell: "Ursa Major", ra: 3.608, dec: 0.86, mag: 1.86, color: "#b8dfff" },
      { name: "Talitha", constell: "Ursa Major", ra: 2.352, dec: 0.838, mag: 3.12, color: "#f8faff" },
      { name: "Tania Australis", constell: "Ursa Major", ra: 2.714, dec: 0.724, mag: 3.06, color: "#ffaa4d" },
      { name: "Schedar", constell: "Cassiopeia", ra: 0.175, dec: 0.987, mag: 2.24, color: "#ffc266", label: "Queen of Heaven" },
      { name: "Caph", constell: "Cassiopeia", ra: 0.039, dec: 1.032, mag: 2.28, color: "#f8f0ff" },
      { name: "Gamma Cas", constell: "Cassiopeia", ra: 0.244, dec: 1.06, mag: 2.15, color: "#b0d9ff", label: "Navi" },
      { name: "Ruchbah", constell: "Cassiopeia", ra: 0.371, dec: 1.051, mag: 2.68, color: "#eef5ff" },
      { name: "Segin", constell: "Cassiopeia", ra: 0.497, dec: 1.111, mag: 3.37, color: "#b5dcff" },
      { name: "Alderamin", constell: "Cepheus", ra: 5.576, dec: 1.092, mag: 2.45, color: "#f4f8ff", label: "King Cepheus" },
      { name: "Alfirk", constell: "Cepheus", ra: 5.62, dec: 1.231, mag: 3.23, color: "#bce4ff" },
      { name: "Errai", constell: "Cepheus", ra: 6.192, dec: 1.355, mag: 3.21, color: "#ffd080" },
      { name: "Delta Cephei", constell: "Cepheus", ra: 5.886, dec: 1.019, mag: 3.75, color: "#ffe899", label: "Cepheid Prototype" },
      { name: "Thuban", constell: "Draco", ra: 3.683, dec: 1.123, mag: 3.67, color: "#f0f6ff", label: "Ancient Pole Star" },
      { name: "Rastaban", constell: "Draco", ra: 4.581, dec: 0.913, mag: 2.79, color: "#ffe899" },
      { name: "Eltanin", constell: "Draco", ra: 4.695, dec: 0.899, mag: 2.23, color: "#ffaa4d", label: "Dragon's Eye" },
      { name: "Grumium", constell: "Draco", ra: 4.682, dec: 0.993, mag: 3.75, color: "#ffe0b2" },
      { name: "Gianfar", constell: "Draco", ra: 3.015, dec: 1.21, mag: 3.87, color: "#ffcc80" },
      { name: "Beta Camelopardalis", constell: "Camelopardalis", ra: 1.322, dec: 1.055, mag: 4.03, color: "#ffe099" },
      { name: "Alpha Camelopardalis", constell: "Camelopardalis", ra: 1.283, dec: 1.158, mag: 4.29, color: "#bce4ff" },
      { name: "Deneb", constell: "Cygnus", ra: 5.415, dec: 0.79, mag: 1.25, color: "#ffffff", label: "Northern Cross Peak" },
      { name: "Sadr", constell: "Cygnus", ra: 5.332, dec: 0.702, mag: 2.23, color: "#fff4d0" },
      { name: "Gienah", constell: "Cygnus", ra: 5.437, dec: 0.593, mag: 2.48, color: "#b8dfff" },
      { name: "Albireo", constell: "Cygnus", ra: 5.105, dec: 0.488, mag: 3.05, color: "#ffd066", label: "Golden Topaz Binary" },
      { name: "Fawaris", constell: "Cygnus", ra: 5.166, dec: 0.787, mag: 2.87, color: "#c4e2ff" },
      { name: "Vega", constell: "Lyra", ra: 4.869, dec: 0.677, mag: 0.03, color: "#c8e8ff", label: "Harp of David" },
      { name: "Sheliak", constell: "Lyra", ra: 4.931, dec: 0.582, mag: 3.45, color: "#f5f0ff" },
      { name: "Sulafat", constell: "Lyra", ra: 4.965, dec: 0.57, mag: 3.24, color: "#bce4ff" },
      { name: "Altair", constell: "Aquila", ra: 5.192, dec: 0.155, mag: 0.77, color: "#f6f8ff", label: "The Flying Eagle" },
      { name: "Tarazed", constell: "Aquila", ra: 5.175, dec: 0.185, mag: 2.72, color: "#ffb366" },
      { name: "Alshain", constell: "Aquila", ra: 5.214, dec: 0.112, mag: 3.71, color: "#ffe6b8" },
      { name: "Alpheratz", constell: "Andromeda", ra: 0.035, dec: 0.508, mag: 2.06, color: "#d2ecff", label: "Great Square Pivot" },
      { name: "Mirach", constell: "Andromeda", ra: 0.301, dec: 0.622, mag: 2.05, color: "#ffaa4d", label: "Guide to M31" },
      { name: "Almach", constell: "Andromeda", ra: 0.537, dec: 0.739, mag: 2.17, color: "#ffd27a", label: "Golden-Indigo Double" },
      { name: "Markab", constell: "Pegasus", ra: 6.039, dec: 0.265, mag: 2.49, color: "#eef5ff", label: "Great Square" },
      { name: "Scheat", constell: "Pegasus", ra: 6.034, dec: 0.49, mag: 2.42, color: "#ff9966", label: "Great Square" },
      { name: "Algenib", constell: "Pegasus", ra: 0.057, dec: 0.265, mag: 2.83, color: "#bce4ff", label: "Great Square" },
      { name: "Enif", constell: "Pegasus", ra: 5.69, dec: 0.172, mag: 2.39, color: "#ffa726", label: "Nose of Pegasus" },
      { name: "Homam", constell: "Pegasus", ra: 5.938, dec: 0.189, mag: 3.41, color: "#d2ecff" },
      { name: "Mothallah", constell: "Triangulum", ra: 0.493, dec: 0.516, mag: 3.41, color: "#f8f8ff" },
      { name: "Beta Trianguli", constell: "Triangulum", ra: 0.563, dec: 0.611, mag: 3.0, color: "#ffffff" },
      { name: "Gamma Trianguli", constell: "Triangulum", ra: 0.598, dec: 0.591, mag: 4.01, color: "#bce4ff" },
      { name: "Mirfak", constell: "Perseus", ra: 0.89, dec: 0.87, mag: 1.79, color: "#fff2b2", label: "Hero Perseus" },
      { name: "Algol", constell: "Perseus", ra: 0.82, dec: 0.715, mag: 2.12, color: "#b8dfff", label: "The Demon Star" },
      { name: "Menkib", constell: "Perseus", ra: 1.038, dec: 0.625, mag: 3.98, color: "#a8d5ff" },
      { name: "Atik", constell: "Perseus", ra: 0.969, dec: 0.556, mag: 3.83, color: "#bce4ff" },
      { name: "Capella", constell: "Auriga", ra: 1.379, dec: 0.803, mag: 0.08, color: "#ffe899", label: "The Little Goat" },
      { name: "Menkalinan", constell: "Auriga", ra: 1.566, dec: 0.784, mag: 1.9, color: "#d8e8ff" },
      { name: "Mahasim", constell: "Auriga", ra: 1.566, dec: 0.649, mag: 2.64, color: "#eef5ff" },
      { name: "Hassaleh", constell: "Auriga", ra: 1.292, dec: 0.579, mag: 2.69, color: "#ffaa4d" },
      { name: "Arcturus", constell: "Boötes", ra: 3.731, dec: 0.335, mag: -0.05, color: "#ffaa4d", label: "Guardian of the Bear" },
      { name: "Nekkar", constell: "Boötes", ra: 3.931, dec: 0.705, mag: 3.49, color: "#ffe099" },
      { name: "Seginus", constell: "Boötes", ra: 3.805, dec: 0.668, mag: 3.03, color: "#f0f6ff" },
      { name: "Izar", constell: "Boötes", ra: 3.857, dec: 0.472, mag: 2.37, color: "#ffc266", label: "Pulcherrima" },
      { name: "Muphrid", constell: "Boötes", ra: 3.639, dec: 0.321, mag: 2.68, color: "#ffe899" },
      { name: "Alphecca", constell: "Corona Borealis", ra: 4.075, dec: 0.466, mag: 2.23, color: "#ffffff", label: "The Pearl of the Crown" },
      { name: "Nusakan", constell: "Corona Borealis", ra: 4.045, dec: 0.508, mag: 3.68, color: "#fff0cc" },
      { name: "Cor Caroli", constell: "Canes Venatici", ra: 3.386, dec: 0.669, mag: 2.89, color: "#d2ecff", label: "Heart of Charles" },
      { name: "Chara", constell: "Canes Venatici", ra: 3.286, dec: 0.722, mag: 4.26, color: "#ffe899" },
      { name: "Diadem", constell: "Coma Berenices", ra: 3.447, dec: 0.306, mag: 4.32, color: "#f8f8ff", label: "Crown of Berenice" },
      { name: "Beta Comae", constell: "Coma Berenices", ra: 3.451, dec: 0.486, mag: 4.26, color: "#fff4d0" },
      { name: "Kornephoros", constell: "Hercules", ra: 4.32, dec: 0.375, mag: 2.81, color: "#ffe899" },
      { name: "Rasalgethi", constell: "Hercules", ra: 4.512, dec: 0.251, mag: 3.48, color: "#ff7043", label: "Head of the Kneeler" },
      { name: "Ruticulus", constell: "Hercules", ra: 4.368, dec: 0.552, mag: 3.14, color: "#ffe0b2" },
      { name: "Sarin", constell: "Hercules", ra: 4.516, dec: 0.433, mag: 3.12, color: "#f0f6ff" },
      { name: "Rasalhague", constell: "Ophiuchus", ra: 4.599, dec: 0.219, mag: 2.08, color: "#f0f6ff", label: "Serpent Bearer" },
      { name: "Cebalrai", constell: "Ophiuchus", ra: 4.638, dec: 0.08, mag: 2.77, color: "#ffaa4d" },
      { name: "Sabik", constell: "Ophiuchus", ra: 4.494, dec: -0.274, mag: 2.43, color: "#f4f8ff" },
      { name: "Han", constell: "Ophiuchus", ra: 4.35, dec: -0.184, mag: 2.56, color: "#a8d5ff" },
      { name: "Unukalhai", constell: "Serpens", ra: 4.119, dec: 0.112, mag: 2.63, color: "#ffaa4d", label: "Heart of the Serpent" },
      { name: "Alya", constell: "Serpens", ra: 4.957, dec: 0.073, mag: 4.62, color: "#ffffff" },
      { name: "Hamal", constell: "Aries", ra: 0.554, dec: 0.409, mag: 2.01, color: "#ffaa4d", label: "The Ram's Horn" },
      { name: "Sheratan", constell: "Aries", ra: 0.497, dec: 0.363, mag: 2.64, color: "#f4f8ff" },
      { name: "Mesarthim", constell: "Aries", ra: 0.493, dec: 0.337, mag: 3.88, color: "#d2ecff" },
      { name: "Aldebaran", constell: "Taurus", ra: 1.2, dec: 0.288, mag: 0.85, color: "#ff8c40", label: "Eye of the Bull" },
      { name: "Elnath", constell: "Taurus", ra: 1.422, dec: 0.499, mag: 1.65, color: "#c4e5ff", label: "Horn of the Bull" },
      { name: "Tianguan", constell: "Taurus", ra: 1.47, dec: 0.369, mag: 2.97, color: "#b8dfff" },
      { name: "Alcyone", constell: "Pleiades", ra: 0.99, dec: 0.421, mag: 2.87, color: "#a5d8ff", label: "Seven Sisters" },
      { name: "Pollux", constell: "Gemini", ra: 2.029, dec: 0.489, mag: 1.16, color: "#ffd27a", label: "Immortal Twin" },
      { name: "Castor", constell: "Gemini", ra: 1.981, dec: 0.556, mag: 1.58, color: "#ffffff", label: "Mortal Twin" },
      { name: "Alhena", constell: "Gemini", ra: 1.732, dec: 0.286, mag: 1.93, color: "#f0f6ff" },
      { name: "Wasat", constell: "Gemini", ra: 1.92, dec: 0.383, mag: 3.53, color: "#fff0cc" },
      { name: "Mebsuta", constell: "Gemini", ra: 1.758, dec: 0.438, mag: 3.06, color: "#ffe899" },
      { name: "Altarf", constell: "Cancer", ra: 2.4, dec: 0.16, mag: 3.52, color: "#ffaa4d" },
      { name: "Acubens", constell: "Cancer", ra: 2.347, dec: 0.207, mag: 4.26, color: "#f8f8ff" },
      { name: "Asellus Australis", constell: "Cancer", ra: 2.286, dec: 0.317, mag: 3.94, color: "#ffe099", label: "Praesepe Beehive Gate" },
      { name: "Asellus Borealis", constell: "Cancer", ra: 2.282, dec: 0.317, mag: 4.66, color: "#f4f8ff" },
      { name: "Regulus", constell: "Leo", ra: 2.653, dec: 0.209, mag: 1.36, color: "#b8e2ff", label: "Heart of the Lion" },
      { name: "Algieba", constell: "Leo", ra: 2.701, dec: 0.346, mag: 2.01, color: "#ffd066", label: "Lion's Mane Binary" },
      { name: "Denebola", constell: "Leo", ra: 3.094, dec: 0.254, mag: 2.14, color: "#f0f6ff", label: "Tail of the Lion" },
      { name: "Zosma", constell: "Leo", ra: 2.941, dec: 0.358, mag: 2.56, color: "#ffffff" },
      { name: "Rasalas", constell: "Leo", ra: 2.583, dec: 0.454, mag: 3.88, color: "#ffaa4d" },
      { name: "Spica", constell: "Virgo", ra: 3.512, dec: -0.195, mag: 0.98, color: "#b8e2ff", label: "Ear of Wheat" },
      { name: "Zavijava", constell: "Virgo", ra: 3.098, dec: 0.031, mag: 3.61, color: "#fff0cc" },
      { name: "Porrima", constell: "Virgo", ra: 3.32, dec: -0.025, mag: 2.74, color: "#f0f6ff", label: "Goddess of Prophecy" },
      { name: "Vindemiatrix", constell: "Virgo", ra: 3.412, dec: 0.191, mag: 2.85, color: "#ffe899", label: "Grape Gatherer" },
      { name: "Zubeneschamali", constell: "Libra", ra: 4.001, dec: -0.163, mag: 2.61, color: "#b8ffff", label: "Northern Claw (Emerald)" },
      { name: "Zubenelgenubi", constell: "Libra", ra: 3.883, dec: -0.28, mag: 2.75, color: "#f4f8ff", label: "Southern Claw" },
      { name: "Brachium", constell: "Libra", ra: 3.944, dec: -0.441, mag: 3.25, color: "#ff7043" },
      { name: "Antares", constell: "Scorpius", ra: 4.315, dec: -0.461, mag: 1.06, color: "#ff5030", label: "Heart of the Scorpion" },
      { name: "Graffias", constell: "Scorpius", ra: 4.211, dec: -0.346, mag: 2.56, color: "#bce4ff" },
      { name: "Dschubba", constell: "Scorpius", ra: 4.189, dec: -0.395, mag: 2.29, color: "#a8d5ff", label: "Forehead of Scorpion" },
      { name: "Sargas", constell: "Scorpius", ra: 4.612, dec: -0.75, mag: 1.86, color: "#ffd27a" },
      { name: "Shaula", constell: "Scorpius", ra: 4.595, dec: -0.648, mag: 1.62, color: "#b8dfff", label: "The Stinger" },
      { name: "Lesath", constell: "Scorpius", ra: 4.581, dec: -0.651, mag: 2.7, color: "#bce4ff" },
      { name: "Kaus Australis", constell: "Sagittarius", ra: 4.817, dec: -0.6, mag: 1.79, color: "#bce4ff", label: "Archer's Bow Base" },
      { name: "Kaus Media", constell: "Sagittarius", ra: 4.8, dec: -0.52, mag: 2.72, color: "#ffaa4d" },
      { name: "Kaus Borealis", constell: "Sagittarius", ra: 4.83, dec: -0.444, mag: 2.82, color: "#ffe899", label: "Teapot Lid Peak" },
      { name: "Nunki", constell: "Sagittarius", ra: 4.952, dec: -0.459, mag: 2.05, color: "#bce4ff", label: "Teapot Handle" },
      { name: "Ascella", constell: "Sagittarius", ra: 4.983, dec: -0.521, mag: 2.6, color: "#f8f8ff" },
      { name: "Alnasl", constell: "Sagittarius", ra: 4.734, dec: -0.531, mag: 2.98, color: "#ffaa4d", label: "Teapot Spout Tip" },
      { name: "Deneb Algedi", constell: "Capricornus", ra: 5.703, dec: -0.281, mag: 2.85, color: "#ffffff", label: "Sea-Goat Tail" },
      { name: "Dabih", constell: "Capricornus", ra: 5.328, dec: -0.258, mag: 3.05, color: "#ffe899" },
      { name: "Algiedi", constell: "Capricornus", ra: 5.315, dec: -0.219, mag: 3.58, color: "#ffd27a", label: "The Sea Goat" },
      { name: "Nashira", constell: "Capricornus", ra: 5.672, dec: -0.291, mag: 3.69, color: "#f0f6ff" },
      { name: "Sadalmelik", constell: "Aquarius", ra: 5.781, dec: 0.006, mag: 2.95, color: "#ffe899", label: "Lucky Star of the King" },
      { name: "Sadalsuud", constell: "Aquarius", ra: 5.633, dec: -0.097, mag: 2.9, color: "#fff0a8", label: "Luck of Lucks" },
      { name: "Sadachbia", constell: "Aquarius", ra: 5.851, dec: -0.024, mag: 3.84, color: "#eef5ff" },
      { name: "Skat", constell: "Aquarius", ra: 5.995, dec: -0.276, mag: 3.27, color: "#f0f6ff" },
      { name: "Alrescha", constell: "Pisces", ra: 0.532, dec: 0.048, mag: 3.82, color: "#ffffff", label: "The Knot of Pisces" },
      { name: "Fumalsamakah", constell: "Pisces", ra: 6.096, dec: 0.057, mag: 4.48, color: "#bce4ff" },
      { name: "Torcular", constell: "Pisces", ra: 0.319, dec: 0.132, mag: 4.28, color: "#ffe099" },
      { name: "Betelgeuse", constell: "Orion", ra: 1.549, dec: 0.129, mag: 0.5, color: "#ff7340", label: "Red Supergiant Shoulder" },
      { name: "Rigel", constell: "Orion", ra: 1.37, dec: -0.143, mag: 0.13, color: "#a8e0ff", label: "Diamond Foot of Orion" },
      { name: "Bellatrix", constell: "Orion", ra: 1.418, dec: 0.111, mag: 1.64, color: "#c0e5ff", label: "Amazon Star" },
      { name: "Saiph", constell: "Orion", ra: 1.514, dec: -0.169, mag: 2.07, color: "#b0dbff" },
      { name: "Alnitak", constell: "Orion", ra: 1.484, dec: -0.034, mag: 1.74, color: "#bce4ff", label: "Belt of Orion" },
      { name: "Alnilam", constell: "Orion", ra: 1.466, dec: -0.021, mag: 1.69, color: "#bce4ff", label: "Belt of Orion" },
      { name: "Mintaka", constell: "Orion", ra: 1.449, dec: 0.005, mag: 2.25, color: "#bce4ff", label: "Belt of Orion" },
      { name: "Sirius", constell: "Canis Major", ra: 1.767, dec: -0.291, mag: -1.46, color: "#e0f6ff", label: "The Scorcher • Brightest Star" },
      { name: "Adhara", constell: "Canis Major", ra: 1.824, dec: -0.506, mag: 1.5, color: "#bce4ff" },
      { name: "Wezen", constell: "Canis Major", ra: 1.868, dec: -0.46, mag: 1.83, color: "#ffe899" },
      { name: "Mirzam", constell: "Canis Major", ra: 1.667, dec: -0.313, mag: 1.98, color: "#bce4ff", label: "The Herald" },
      { name: "Aludra", constell: "Canis Major", ra: 1.937, dec: -0.511, mag: 2.45, color: "#a8d5ff" },
      { name: "Procyon", constell: "Canis Minor", ra: 2.003, dec: 0.091, mag: 0.38, color: "#fff0c0", label: "Little Dog Star" },
      { name: "Gomeisa", constell: "Canis Minor", ra: 1.95, dec: 0.145, mag: 2.89, color: "#bce4ff" },
      { name: "Arneb", constell: "Lepus", ra: 1.449, dec: -0.311, mag: 2.58, color: "#f8f8ff", label: "The Hare" },
      { name: "Nihal", constell: "Lepus", ra: 1.431, dec: -0.362, mag: 2.81, color: "#ffe099" },
      { name: "Beta Monocerotis", constell: "Monoceros", ra: 1.693, dec: -0.122, mag: 3.74, color: "#bce4ff", label: "Unicorn Triple Star" },
      { name: "Alpha Monocerotis", constell: "Monoceros", ra: 2.011, dec: -0.167, mag: 3.94, color: "#ffd080" },
      { name: "Acrux", constell: "Crux", ra: 3.255, dec: -1.101, mag: 0.77, color: "#bce4ff", label: "Southern Cross Base" },
      { name: "Mimosa", constell: "Crux", ra: 3.347, dec: -1.042, mag: 1.25, color: "#b8dfff", label: "Southern Cross Arm" },
      { name: "Gacrux", constell: "Crux", ra: 3.277, dec: -0.997, mag: 1.64, color: "#ff7043", label: "Southern Cross Top" },
      { name: "Imai", constell: "Crux", ra: 3.207, dec: -1.025, mag: 2.79, color: "#c4e2ff" },
      { name: "Rigil Kentaurus", constell: "Centaurus", ra: 3.835, dec: -1.062, mag: -0.27, color: "#ffe899", label: "Alpha Centauri • Nearest Sun" },
      { name: "Hadar", constell: "Centaurus", ra: 3.678, dec: -1.054, mag: 0.61, color: "#bce4ff", label: "Beta Centauri • Southern Pointer" },
      { name: "Menkent", constell: "Centaurus", ra: 3.691, dec: -0.635, mag: 2.06, color: "#ffaa4d" },
      { name: "Muhlifain", constell: "Centaurus", ra: 3.574, dec: -0.933, mag: 2.2, color: "#d2ecff" },
      { name: "Men Lupi", constell: "Lupus", ra: 3.844, dec: -0.827, mag: 2.3, color: "#bce4ff", label: "Celestial Wolf" },
      { name: "Beta Lupi", constell: "Lupus", ra: 3.918, dec: -0.753, mag: 2.68, color: "#bce4ff" },
      { name: "Canopus", constell: "Carina", ra: 1.671, dec: -0.919, mag: -0.74, color: "#f8f8ff", label: "The Great Navigator • 2nd Brightest" },
      { name: "Miaplacidus", constell: "Carina", ra: 2.413, dec: -1.217, mag: 1.67, color: "#ffffff" },
      { name: "Avior", constell: "Carina", ra: 2.19, dec: -1.038, mag: 1.86, color: "#ffaa4d", label: "False Cross" },
      { name: "Aspidiske", constell: "Carina", ra: 2.43, dec: -1.034, mag: 2.21, color: "#f0f6ff", label: "False Cross" },
      { name: "Suhail", constell: "Vela", ra: 2.387, dec: -0.758, mag: 2.23, color: "#ff7043" },
      { name: "Alsephina", constell: "Vela", ra: 2.286, dec: -0.955, mag: 1.78, color: "#ffffff", label: "False Cross" },
      { name: "Markeb", constell: "Vela", ra: 2.452, dec: -0.96, mag: 2.47, color: "#bce4ff", label: "False Cross" },
      { name: "Naos", constell: "Puppis", ra: 2.107, dec: -0.698, mag: 2.21, color: "#a8d5ff", label: "Blue Supergiant Stern" },
      { name: "Azmidi", constell: "Puppis", ra: 1.998, dec: -0.409, mag: 3.34, color: "#ffe899" },
      { name: "Alpha Pyxidis", constell: "Pyxis", ra: 2.282, dec: -0.579, mag: 3.68, color: "#bce4ff", label: "Mariner's Compass" },
      { name: "Achernar", constell: "Eridanus", ra: 0.423, dec: -0.999, mag: 0.45, color: "#b8e2ff", label: "End of the River" },
      { name: "Cursa", constell: "Eridanus", ra: 1.34, dec: -0.089, mag: 2.78, color: "#f4f8ff" },
      { name: "Zaurak", constell: "Eridanus", ra: 1.038, dec: -0.236, mag: 2.97, color: "#ffaa4d" },
      { name: "Acamar", constell: "Eridanus", ra: 0.777, dec: -0.703, mag: 3.2, color: "#d2ecff" },
      { name: "Diphda", constell: "Cetus", ra: 0.188, dec: -0.314, mag: 2.04, color: "#ffe899", label: "Tail of Sea Monster" },
      { name: "Menkar", constell: "Cetus", ra: 0.794, dec: 0.071, mag: 2.54, color: "#ff7043", label: "Nose of Whale" },
      { name: "Baten Kaitos", constell: "Cetus", ra: 0.489, dec: -0.18, mag: 3.74, color: "#ffd27a" },
      { name: "Ankaa", constell: "Phoenix", ra: 0.113, dec: -0.738, mag: 2.4, color: "#ffaa4d", label: "The Firebird" },
      { name: "Beta Phoenicis", constell: "Phoenix", ra: 0.288, dec: -0.815, mag: 3.32, color: "#ffe899" },
      { name: "Dalim", constell: "Fornax", ra: 0.838, dec: -0.506, mag: 3.86, color: "#fff0cc", label: "The Furnace" },
      { name: "Alpha Horologii", constell: "Horologium", ra: 1.108, dec: -0.738, mag: 3.85, color: "#ffd27a", label: "The Pendulum Clock" },
      { name: "Fomalhaut", constell: "Piscis Austrinus", ra: 6.008, dec: -0.517, mag: 1.17, color: "#f0f6ff", label: "The Solitary Watcher" },
      { name: "Alnair", constell: "Grus", ra: 5.794, dec: -0.819, mag: 1.73, color: "#b8e2ff", label: "The Crane" },
      { name: "Tiaki", constell: "Grus", ra: 5.943, dec: -0.818, mag: 2.11, color: "#ff7043" },
      { name: "Aldhanab", constell: "Grus", ra: 5.729, dec: -0.652, mag: 3.01, color: "#bce4ff" },
      { name: "Peacock", constell: "Pavo", ra: 5.345, dec: -0.99, mag: 1.94, color: "#a8d5ff", label: "The Peacock Eye" },
      { name: "Beta Pavonis", constell: "Pavo", ra: 5.428, dec: -1.155, mag: 3.42, color: "#ffffff" },
      { name: "Alpha Tucanae", constell: "Tucana", ra: 5.838, dec: -1.052, mag: 2.87, color: "#ffaa4d", label: "The Toucan" },
      { name: "Beta Tucanae", constell: "Tucana", ra: 0.135, dec: -1.099, mag: 4.36, color: "#bce4ff" },
      { name: "Alpha Apodis", constell: "Apus", ra: 3.87, dec: -1.379, mag: 3.83, color: "#ffaa4d", label: "Bird of Paradise" },
      { name: "Delta Apodis", constell: "Apus", ra: 4.276, dec: -1.373, mag: 4.68, color: "#ff7043" },
      { name: "Alphard", constell: "Hydra", ra: 2.474, dec: -0.151, mag: 1.99, color: "#ffaa4d", label: "Solitary Heart of Hydra" },
      { name: "Minchir", constell: "Hydra", ra: 2.295, dec: 0.112, mag: 4.45, color: "#ffaa4d" },
      { name: "Alkes", constell: "Crater", ra: 2.875, dec: -0.319, mag: 4.08, color: "#ffaa4d", label: "The Sacred Chalice" },
      { name: "Labrum", constell: "Crater", ra: 2.963, dec: -0.258, mag: 3.57, color: "#ffffff" },
      { name: "Gienah Corvi", constell: "Corvus", ra: 3.207, dec: -0.306, mag: 2.58, color: "#bce4ff", label: "Wing of the Raven" },
      { name: "Algorab", constell: "Corvus", ra: 3.268, dec: -0.288, mag: 2.94, color: "#f8f8ff" },
      { name: "Kraz", constell: "Corvus", ra: 3.29, dec: -0.408, mag: 2.65, color: "#ffe899" },
      { name: "Minkar", constell: "Corvus", ra: 3.185, dec: -0.395, mag: 3.02, color: "#ffaa4d" },
      { name: "Alpha Sextantis", constell: "Sextans", ra: 2.649, dec: 0.006, mag: 4.48, color: "#ffffff", label: "Astronomer's Sextant" },
      { name: "Alpha Antliae", constell: "Antlia", ra: 2.736, dec: -0.542, mag: 4.28, color: "#ffaa4d", label: "The Air Pump" },
      { name: "Beta Arae", constell: "Ara", ra: 4.56, dec: -0.969, mag: 2.84, color: "#ffaa4d", label: "The Altar of the Gods" },
      { name: "Alpha Arae", constell: "Ara", ra: 4.586, dec: -0.87, mag: 2.85, color: "#bce4ff" },
      { name: "Meridiana", constell: "Corona Australis", ra: 5.013, dec: -0.661, mag: 4.11, color: "#ffffff", label: "Southern Crown" },
      { name: "Beta Coronae Australis", constell: "Corona Australis", ra: 5.018, dec: -0.686, mag: 4.1, color: "#ffe899" },
      { name: "Alpha Telescopii", constell: "Telescopium", ra: 4.826, dec: -0.802, mag: 3.49, color: "#bce4ff", label: "Herschel's Telescope" },
      { name: "Gamma 2 Normae", constell: "Norma", ra: 4.272, dec: -0.875, mag: 4.01, color: "#ffe899", label: "The Carpenter's Level" },
      { name: "Alpha Circini", constell: "Circinus", ra: 3.848, dec: -1.134, mag: 3.18, color: "#ffffff", label: "The Compasses" },
      { name: "Atria", constell: "Triangulum Australe", ra: 4.398, dec: -1.205, mag: 1.91, color: "#ffaa4d", label: "Apex of Southern Triangle" },
      { name: "Betria", constell: "Triangulum Australe", ra: 4.167, dec: -1.107, mag: 2.83, color: "#ffffff" },
      { name: "Gatria", constell: "Triangulum Australe", ra: 4.006, dec: -1.198, mag: 2.87, color: "#ffffff" },
      { name: "Polaris Australis", constell: "Octans", ra: 5.533, dec: -1.552, mag: 5.45, color: "#fff0cc", label: "South Pole Star" },
      { name: "Nu Octantis", constell: "Octans", ra: 5.677, dec: -1.351, mag: 3.73, color: "#ffe899" },
      { name: "Head of Hydrus", constell: "Hydrus", ra: 0.515, dec: -1.075, mag: 2.86, color: "#f8f8ff", label: "Little Water Snake" },
      { name: "Beta Hydri", constell: "Hydrus", ra: 0.109, dec: -1.348, mag: 2.82, color: "#ffe899" },
      { name: "Alpha Mensae", constell: "Mensa", ra: 1.641, dec: -1.305, mag: 5.08, color: "#ffe899", label: "Table Mountain" },
      { name: "Gamma Mensae", constell: "Mensa", ra: 1.444, dec: -1.332, mag: 5.18, color: "#ffaa4d" },
      { name: "Beta Volantis", constell: "Volans", ra: 2.203, dec: -1.154, mag: 3.77, color: "#ffaa4d", label: "The Flying Fish" },
      { name: "Gamma Volantis", constell: "Volans", ra: 1.868, dec: -1.23, mag: 3.78, color: "#ffe899" },
      { name: "Alpha Chamaeleontis", constell: "Chamaeleon", ra: 2.173, dec: -1.342, mag: 4.05, color: "#f8f8ff", label: "The Chameleon" },
      { name: "Gamma Chamaeleontis", constell: "Chamaeleon", ra: 2.771, dec: -1.372, mag: 4.11, color: "#ff7043" },
      { name: "Alpha Muscae", constell: "Musca", ra: 3.303, dec: -1.207, mag: 2.69, color: "#b8dfff", label: "The Southern Fly" },
      { name: "Beta Muscae", constell: "Musca", ra: 3.342, dec: -1.189, mag: 3.04, color: "#bce4ff" },
      { name: "Alpha Doradus", constell: "Dorado", ra: 1.191, dec: -0.961, mag: 3.3, color: "#ffffff", label: "The Swordfish" },
      { name: "Beta Doradus", constell: "Dorado", ra: 1.453, dec: -1.091, mag: 3.76, color: "#ffe899" },
      { name: "Alpha Reticuli", constell: "Reticulum", ra: 1.108, dec: -1.09, mag: 3.33, color: "#ffe899", label: "The Reticle" },
      { name: "Beta Reticuli", constell: "Reticulum", ra: 0.977, dec: -1.131, mag: 3.84, color: "#ffaa4d" },
      { name: "Alpha Pictoris", constell: "Pictor", ra: 1.78, dec: -1.081, mag: 3.24, color: "#ffffff", label: "Painter's Easel" },
      { name: "Beta Pictoris", constell: "Pictor", ra: 1.514, dec: -0.891, mag: 3.85, color: "#ffffff", label: "Exoplanetary Disk" },
      { name: "Alpha Caeli", constell: "Caelum", ra: 1.222, dec: -0.73, mag: 4.44, color: "#fff0cc", label: "The Chisel" },
      { name: "Gamma Caeli", constell: "Caelum", ra: 1.326, dec: -0.619, mag: 4.55, color: "#ffaa4d" },
      { name: "Phact", constell: "Columba", ra: 1.479, dec: -0.595, mag: 2.65, color: "#bce4ff", label: "Noah's Dove" },
      { name: "Wazn", constell: "Columba", ra: 1.527, dec: -0.624, mag: 3.12, color: "#ffaa4d" },
      { name: "The Persian", constell: "Indus", ra: 5.397, dec: -0.825, mag: 3.11, color: "#ffaa4d", label: "The Indus Star" },
      { name: "Beta Indi", constell: "Indus", ra: 5.472, dec: -1.02, mag: 3.67, color: "#ffaa4d" },
      { name: "Gamma Microscopii", constell: "Microscopium", ra: 5.502, dec: -0.563, mag: 4.67, color: "#ffe899", label: "The Microscope" },
      { name: "Alpha Sculptoris", constell: "Sculptor", ra: 0.253, dec: -0.66, mag: 4.3, color: "#bce4ff", label: "Sculptor's Studio" },
      { name: "Rotanev", constell: "Delphinus", ra: 5.397, dec: 0.255, mag: 3.64, color: "#f8f8ff", label: "The Dolphin" },
      { name: "Sualocin", constell: "Delphinus", ra: 5.406, dec: 0.278, mag: 3.77, color: "#bce4ff" },
      { name: "Gamma Delphini", constell: "Delphinus", ra: 5.437, dec: 0.281, mag: 3.87, color: "#ffe899" },
      { name: "Sham", constell: "Sagitta", ra: 5.149, dec: 0.314, mag: 4.39, color: "#ffe899", label: "The Celestial Arrow" },
      { name: "Gamma Sagittae", constell: "Sagitta", ra: 5.227, dec: 0.34, mag: 3.51, color: "#ffaa4d" },
      { name: "Kitalpha", constell: "Equuleus", ra: 5.563, dec: 0.091, mag: 3.92, color: "#ffe899", label: "The Little Foal" },
      { name: "Anser", constell: "Vulpecula", ra: 5.096, dec: 0.43, mag: 4.44, color: "#ff7043", label: "The Little Fox" },
      { name: "Alpha Scuti", constell: "Scutum", ra: 4.865, dec: -0.144, mag: 3.85, color: "#ffaa4d", label: "Shield of Sobieski" },
      { name: "Beta Scuti", constell: "Scutum", ra: 4.917, dec: -0.083, mag: 4.22, color: "#ffe899" },
      { name: "Alpha Lacertae", constell: "Lacerta", ra: 5.895, dec: 0.877, mag: 3.76, color: "#ffffff", label: "The Lizard" },
      { name: "Beta Lacertae", constell: "Lacerta", ra: 5.86, dec: 0.911, mag: 4.42, color: "#ffe899" },
      { name: "Praecipua", constell: "Leo Minor", ra: 2.849, dec: 0.597, mag: 3.79, color: "#ffaa4d", label: "The Little Lion" },
      { name: "Alpha Lyncis", constell: "Lynx", ra: 2.448, dec: 0.6, mag: 3.14, color: "#ff7043", label: "The Lynx Eye" },
      { name: "38 Lyncis", constell: "Lynx", ra: 2.435, dec: 0.642, mag: 3.82, color: "#ffffff" }
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
      ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"], ["Megrez", "Dubhe"],
      ["Megrez", "Alioth"], ["Alioth", "Mizar"], ["Mizar", "Alkaid"], ["Phecda", "Tania Australis"],
      ["Dubhe", "Talitha"], ["Dubhe", "Polaris"], ["Polaris", "Yildun"], ["Yildun", "Pherkad"],
      ["Pherkad", "Kochab"], ["Kochab", "Yildun"], ["Caph", "Schedar"], ["Schedar", "Gamma Cas"],
      ["Gamma Cas", "Ruchbah"], ["Ruchbah", "Segin"], ["Alderamin", "Alfirk"], ["Alfirk", "Errai"],
      ["Alderamin", "Delta Cephei"], ["Delta Cephei", "Alfirk"], ["Rastaban", "Eltanin"], ["Eltanin", "Grumium"],
      ["Grumium", "Rastaban"], ["Grumium", "Thuban"], ["Thuban", "Gianfar"], ["Beta Camelopardalis", "Alpha Camelopardalis"],
      ["Deneb", "Sadr"], ["Sadr", "Albireo"], ["Gienah", "Sadr"], ["Sadr", "Fawaris"],
      ["Vega", "Sheliak"], ["Sheliak", "Sulafat"], ["Sulafat", "Vega"], ["Altair", "Tarazed"],
      ["Altair", "Alshain"], ["Markab", "Scheat"], ["Scheat", "Alpheratz"], ["Alpheratz", "Algenib"],
      ["Algenib", "Markab"], ["Markab", "Homam"], ["Homam", "Enif"], ["Alpheratz", "Mirach"],
      ["Mirach", "Almach"], ["Mothallah", "Beta Trianguli"], ["Beta Trianguli", "Gamma Trianguli"], ["Gamma Trianguli", "Mothallah"],
      ["Mirfak", "Algol"], ["Mirfak", "Menkib"], ["Menkib", "Atik"], ["Capella", "Menkalinan"],
      ["Menkalinan", "Mahasim"], ["Mahasim", "Hassaleh"], ["Hassaleh", "Capella"], ["Arcturus", "Muphrid"],
      ["Arcturus", "Izar"], ["Izar", "Seginus"], ["Seginus", "Nekkar"], ["Nekkar", "Izar"],
      ["Alphecca", "Nusakan"], ["Cor Caroli", "Chara"], ["Diadem", "Beta Comae"], ["Kornephoros", "Ruticulus"],
      ["Ruticulus", "Sarin"], ["Sarin", "Rasalgethi"], ["Rasalgethi", "Kornephoros"], ["Rasalhague", "Cebalrai"],
      ["Rasalhague", "Han"], ["Han", "Sabik"], ["Unukalhai", "Alya"], ["Hamal", "Sheratan"],
      ["Sheratan", "Mesarthim"], ["Aldebaran", "Elnath"], ["Aldebaran", "Tianguan"], ["Aldebaran", "Alcyone"],
      ["Castor", "Pollux"], ["Castor", "Mebsuta"], ["Pollux", "Wasat"], ["Wasat", "Alhena"],
      ["Mebsuta", "Alhena"], ["Acubens", "Altarf"], ["Altarf", "Asellus Australis"], ["Asellus Australis", "Asellus Borealis"],
      ["Regulus", "Algieba"], ["Algieba", "Rasalas"], ["Algieba", "Zosma"], ["Zosma", "Denebola"],
      ["Denebola", "Regulus"], ["Spica", "Porrima"], ["Porrima", "Zavijava"], ["Porrima", "Vindemiatrix"],
      ["Zubenelgenubi", "Zubeneschamali"], ["Zubenelgenubi", "Brachium"], ["Graffias", "Dschubba"], ["Dschubba", "Antares"],
      ["Antares", "Sargas"], ["Sargas", "Shaula"], ["Shaula", "Lesath"], ["Alnasl", "Kaus Media"],
      ["Kaus Media", "Kaus Australis"], ["Kaus Australis", "Ascella"], ["Ascella", "Nunki"], ["Nunki", "Kaus Borealis"],
      ["Kaus Borealis", "Kaus Media"], ["Kaus Borealis", "Alnasl"], ["Algiedi", "Dabih"], ["Dabih", "Nashira"],
      ["Nashira", "Deneb Algedi"], ["Deneb Algedi", "Algiedi"], ["Sadalmelik", "Sadalsuud"], ["Sadalmelik", "Sadachbia"],
      ["Sadachbia", "Skat"], ["Alrescha", "Torcular"], ["Torcular", "Fumalsamakah"], ["Betelgeuse", "Bellatrix"],
      ["Bellatrix", "Rigel"], ["Rigel", "Saiph"], ["Saiph", "Betelgeuse"], ["Alnitak", "Alnilam"],
      ["Alnilam", "Mintaka"], ["Betelgeuse", "Alnitak"], ["Bellatrix", "Mintaka"], ["Sirius", "Mirzam"],
      ["Sirius", "Adhara"], ["Adhara", "Wezen"], ["Wezen", "Aludra"], ["Procyon", "Gomeisa"],
      ["Arneb", "Nihal"], ["Beta Monocerotis", "Alpha Monocerotis"], ["Acrux", "Gacrux"], ["Mimosa", "Imai"],
      ["Rigil Kentaurus", "Hadar"], ["Hadar", "Muhlifain"], ["Muhlifain", "Menkent"], ["Men Lupi", "Beta Lupi"],
      ["Canopus", "Miaplacidus"], ["Canopus", "Avior"], ["Avior", "Aspidiske"], ["Suhail", "Alsephina"],
      ["Alsephina", "Markeb"], ["Naos", "Azmidi"], ["Alpha Pyxidis", "Azmidi"], ["Cursa", "Zaurak"],
      ["Zaurak", "Acamar"], ["Acamar", "Achernar"], ["Menkar", "Baten Kaitos"], ["Baten Kaitos", "Diphda"],
      ["Ankaa", "Beta Phoenicis"], ["Dalim", "Zaurak"], ["Alpha Horologii", "Achernar"], ["Fomalhaut", "Alnair"],
      ["Alnair", "Tiaki"], ["Tiaki", "Aldhanab"], ["Peacock", "Beta Pavonis"], ["Alpha Tucanae", "Beta Tucanae"],
      ["Alpha Apodis", "Delta Apodis"], ["Alphard", "Minchir"], ["Alkes", "Labrum"], ["Gienah Corvi", "Algorab"],
      ["Algorab", "Kraz"], ["Kraz", "Minkar"], ["Minkar", "Gienah Corvi"], ["Alpha Sextantis", "Regulus"],
      ["Alpha Antliae", "Alphard"], ["Beta Arae", "Alpha Arae"], ["Meridiana", "Beta Coronae Australis"], ["Alpha Telescopii", "Beta Arae"],
      ["Gamma 2 Normae", "Alpha Arae"], ["Alpha Circini", "Rigil Kentaurus"], ["Atria", "Betria"], ["Betria", "Gatria"],
      ["Gatria", "Atria"], ["Polaris Australis", "Nu Octantis"], ["Head of Hydrus", "Beta Hydri"], ["Alpha Mensae", "Gamma Mensae"],
      ["Beta Volantis", "Gamma Volantis"], ["Alpha Chamaeleontis", "Gamma Chamaeleontis"], ["Alpha Muscae", "Beta Muscae"], ["Alpha Doradus", "Beta Doradus"],
      ["Alpha Reticuli", "Beta Reticuli"], ["Alpha Pictoris", "Beta Pictoris"], ["Alpha Caeli", "Gamma Caeli"], ["Phact", "Wazn"],
      ["The Persian", "Beta Indi"], ["Gamma Microscopii", "Fomalhaut"], ["Alpha Sculptoris", "Ankaa"], ["Rotanev", "Sualocin"],
      ["Sualocin", "Gamma Delphini"], ["Gamma Delphini", "Rotanev"], ["Sham", "Gamma Sagittae"], ["Kitalpha", "Enif"],
      ["Anser", "Albireo"], ["Alpha Scuti", "Beta Scuti"], ["Alpha Lacertae", "Beta Lacertae"], ["Praecipua", "Rasalas"],
      ["Alpha Lyncis", "38 Lyncis"], ["Deneb", "Vega"], ["Vega", "Altair"], ["Altair", "Deneb"],
      ["Betelgeuse", "Sirius"], ["Sirius", "Procyon"], ["Procyon", "Betelgeuse"], ["Arcturus", "Spica"],
      ["Spica", "Denebola"], ["Denebola", "Arcturus"], ["Rigil Kentaurus", "Mimosa"]
    ];

    // C. Deep Cosmic Background Starfield (Procedural 3D Sphere Distribution)
    const isMobile = this.width < 768;
    const backgroundCount = isMobile ? 120 : 200;
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
        const isClickable = e.target.closest("button") || e.target.closest("a") ||
                            e.target.closest(".tarot-3d-card") || e.target.closest(".tarot-3d-stage") ||
                            e.target.closest("#tarotModal") || e.target.closest(".phonograph-card") ||
                            e.target.closest(".rune-pill") || e.target.closest(".repertoire-card") ||
                            e.target.closest(".rose-window-wrapper");
        if (e.detail > 1 && !isClickable) {
          e.preventDefault();
        }
      }
    }, true);

    window.addEventListener("dblclick", (e) => {
      if (!isTextInput(e.target)) {
        const isClickable = e.target.closest("button") || e.target.closest("a") ||
                            e.target.closest(".tarot-3d-card") || e.target.closest(".tarot-3d-stage") ||
                            e.target.closest("#tarotModal") || e.target.closest(".phonograph-card") ||
                            e.target.closest(".rune-pill") || e.target.closest(".repertoire-card") ||
                            e.target.closest(".rose-window-wrapper");
        if (!isClickable) {
          e.preventDefault();
        }
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
               el.closest("#candleShrine") || el.closest(".rune-pill") ||
               el.closest(".phonograph-card") || el.closest(".phonograph-stage") ||
               el.closest("#phonographStage") || el.closest("#phonographStatusBadge") ||
               el.closest(".vinyl-record") || el.closest(".record-center-label") ||
               el.closest(".rose-window-wrapper") || el.closest(".rose-stained-window") ||
               el.closest("#tarotModal") || el.closest(".tarot-modal-backdrop") ||
               el.closest(".tarot-3d-stage") || el.closest(".tarot-3d-card") ||
               el.closest(".tarot-face") ||
               el.closest(".reliquary-card") || el.closest(".tome-card");
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
    let closestDist = 28;

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
