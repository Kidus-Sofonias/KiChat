export const AVATAR_OPTIONS = [
  {
    id: "aurora-bot",
    name: "Aurora Bot",
    mood: "Warm and welcoming",
  },
  {
    id: "nova-pilot",
    name: "Nova Pilot",
    mood: "Bright and upbeat",
  },
  {
    id: "atlas-core",
    name: "Atlas Core",
    mood: "Calm and grounded",
  },
  {
    id: "circuit-scout",
    name: "Circuit Scout",
    mood: "Curious and alert",
  },
  {
    id: "echo-unit",
    name: "Echo Unit",
    mood: "Clean and polished",
  },
  {
    id: "pixel-guard",
    name: "Pixel Guard",
    mood: "Sharp and playful",
  },
  {
    id: "orbit-one",
    name: "Orbit One",
    mood: "Soft sci-fi look",
  },
  {
    id: "kilo-spark",
    name: "Kilo Spark",
    mood: "Energetic and friendly",
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
  const remixedSeed = `${seed}-mk2`;

  return `https://robohash.org/${encodeURIComponent(
    remixedSeed
  )}.png?size=${size}x${size}&set=set1&bgset=${backgroundVariant}`;
};
