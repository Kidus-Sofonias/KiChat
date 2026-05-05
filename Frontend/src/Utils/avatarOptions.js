export const AVATAR_OPTIONS = [
  {
    id: "aurora-bot",
    name: "Aurora Bot",
    mood: "Warm and welcoming",
    series: "Mk I",
  },
  {
    id: "nova-pilot",
    name: "Nova Pilot",
    mood: "Bright and upbeat",
    series: "Mk II",
  },
  {
    id: "atlas-core",
    name: "Atlas Core",
    mood: "Calm and grounded",
    series: "Mk III",
  },
  {
    id: "circuit-scout",
    name: "Circuit Scout",
    mood: "Curious and alert",
    series: "Mk IV",
  },
  {
    id: "echo-unit",
    name: "Echo Unit",
    mood: "Clean and polished",
    series: "Mk V",
  },
  {
    id: "pixel-guard",
    name: "Pixel Guard",
    mood: "Sharp and playful",
    series: "Mk VI",
  },
  {
    id: "orbit-one",
    name: "Orbit One",
    mood: "Soft sci-fi look",
    series: "Mk VII",
  },
  {
    id: "kilo-spark",
    name: "Kilo Spark",
    mood: "Energetic and friendly",
    series: "Mk VIII",
  },
  {
    id: "ember-frame",
    name: "Ember Frame",
    mood: "Bold and fiery",
    series: "Mk IX",
  },
  {
    id: "vector-prime",
    name: "Vector Prime",
    mood: "Fast and precise",
    series: "Mk X",
  },
  {
    id: "onyx-guard",
    name: "Onyx Guard",
    mood: "Stealth and focus",
    series: "Mk XI",
  },
  {
    id: "solstice-arc",
    name: "Solstice Arc",
    mood: "Bright and elite",
    series: "Mk XII",
  },
  {
    id: "radar-flux",
    name: "Radar Flux",
    mood: "Tactical and aware",
    series: "Mk XIII",
  },
  {
    id: "halo-forge",
    name: "Halo Forge",
    mood: "Heavy and resilient",
    series: "Mk XIV",
  },
  {
    id: "ion-drift",
    name: "Ion Drift",
    mood: "Aerial and smooth",
    series: "Mk XV",
  },
  {
    id: "titan-veil",
    name: "Titan Veil",
    mood: "Massive and composed",
    series: "Mk XVI",
  },
];

const BACKGROUND_VARIANTS = ["bg1", "bg2", "bg3"];

const hashSeed = (value = "") =>
  String(value)
    .split("")
    .reduce((total, character, index) => total + character.charCodeAt(0) * (index + 11), 0);

export const buildAvatarUrl = (avatarSeed, fallbackSeed = "aurora-bot", size = 96) => {
  const seed = String(avatarSeed || fallbackSeed || "aurora-bot");
  const hash = hashSeed(seed);
  const backgroundVariant = BACKGROUND_VARIANTS[hash % BACKGROUND_VARIANTS.length];
  const remixedSeed = `${seed}-armored-classic`;

  return `https://robohash.org/${encodeURIComponent(
    remixedSeed
  )}.png?size=${size}x${size}&set=set1&bgset=${backgroundVariant}`;
};
