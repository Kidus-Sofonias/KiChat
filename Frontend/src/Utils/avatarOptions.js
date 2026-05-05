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

export const buildAvatarUrl = (avatarSeed, fallbackSeed = "byte-bot", size = 96) =>
  `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(
    avatarSeed || fallbackSeed
  )}&size=${size}&backgroundType=gradientLinear&backgroundRotation=0,90,180,270&eyes=bulging,glow,roundFrame,robocop,shade01&mouth=grill01,grill02,smile01,smile02`;
