export const AVATAR_OPTIONS = [
  {
    id: "byte-bot",
    name: "Byte Bot",
    mood: "Friendly classic",
  },
  {
    id: "nova-pilot",
    name: "Nova Pilot",
    mood: "Fast and playful",
  },
  {
    id: "atlas-core",
    name: "Atlas Core",
    mood: "Steady and bold",
  },
  {
    id: "circuit-scout",
    name: "Circuit Scout",
    mood: "Curious explorer",
  },
  {
    id: "echo-unit",
    name: "Echo Unit",
    mood: "Clean and modern",
  },
  {
    id: "pixel-guard",
    name: "Pixel Guard",
    mood: "Bright and sharp",
  },
  {
    id: "orbit-one",
    name: "Orbit One",
    mood: "Space-age look",
  },
  {
    id: "kilo-spark",
    name: "Kilo Spark",
    mood: "Energetic vibe",
  },
];

export const buildAvatarUrl = (avatarSeed, fallbackSeed = "byte-bot", size = 96) =>
  `https://robohash.org/${encodeURIComponent(
    avatarSeed || fallbackSeed
  )}.png?size=${size}x${size}&set=set1&bgset=bg1`;
