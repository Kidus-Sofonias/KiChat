export const AVATAR_OPTIONS = [
  {
    id: "mark-01-aegis",
    name: "Mark I Aegis",
    mood: "Heavy prototype armor",
  },
  {
    id: "mark-02-vanguard",
    name: "Mark II Vanguard",
    mood: "Sleek flight shell",
  },
  {
    id: "mark-03-crimson",
    name: "Mark III Crimson",
    mood: "Classic battle frame",
  },
  {
    id: "mark-05-sentinel",
    name: "Mark V Sentinel",
    mood: "Portable response suit",
  },
  {
    id: "mark-07-arcstar",
    name: "Mark VII Arcstar",
    mood: "Polished command armor",
  },
  {
    id: "mark-12-stratos",
    name: "Mark XII Stratos",
    mood: "High-altitude interceptor",
  },
  {
    id: "mark-21-titan",
    name: "Mark XXI Titan",
    mood: "Deep-space heavy suit",
  },
  {
    id: "mark-33-photon",
    name: "Mark XXXIII Photon",
    mood: "Agile energy armor",
  },
];

const BACKGROUND_VARIANTS = ["bg1", "bg2", "bg3"];

const hashSeed = (value = "") =>
  String(value)
    .split("")
    .reduce((total, character, index) => total + character.charCodeAt(0) * (index + 11), 0);

export const buildAvatarUrl = (avatarSeed, fallbackSeed = "mark-01-aegis", size = 96) => {
  const seed = String(avatarSeed || fallbackSeed || "mark-01-aegis");
  const hash = hashSeed(seed);
  const backgroundVariant = BACKGROUND_VARIANTS[hash % BACKGROUND_VARIANTS.length];
  const remixedSeed = `${seed}-armored-mark`;

  return `https://robohash.org/${encodeURIComponent(
    remixedSeed
  )}.png?size=${size}x${size}&set=set1&bgset=${backgroundVariant}`;
};
