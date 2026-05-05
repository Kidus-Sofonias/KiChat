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

const AVATAR_THEMES = [
  {
    bgA: "#0d1529",
    bgB: "#244b8f",
    shell: "#dbe8ff",
    shellDark: "#8aa8d8",
    accent: "#79d8ff",
    eye: "#09111f",
    glow: "#7be3ff",
  },
  {
    bgA: "#120d23",
    bgB: "#4a3697",
    shell: "#efe7ff",
    shellDark: "#b59ddd",
    accent: "#ffad70",
    eye: "#130b24",
    glow: "#ffd37b",
  },
  {
    bgA: "#071b1d",
    bgB: "#1d6e73",
    shell: "#dffdf3",
    shellDark: "#86c8bd",
    accent: "#77ffd0",
    eye: "#041113",
    glow: "#87ffe3",
  },
  {
    bgA: "#18110b",
    bgB: "#8f5f2a",
    shell: "#fff0d9",
    shellDark: "#d6b283",
    accent: "#ffcf7f",
    eye: "#1a1008",
    glow: "#ffe59b",
  },
];

const hashSeed = (value = "") =>
  String(value)
    .split("")
    .reduce((total, character, index) => total + character.charCodeAt(0) * (index + 17), 0);

const buildGradientId = (seed) => `avatar-gradient-${seed}`;

const buildAntenna = (variant, theme) => {
  if (variant === 0) {
    return `
      <path d="M56 26 L56 18" stroke="${theme.shellDark}" stroke-width="4" stroke-linecap="round" />
      <circle cx="56" cy="14" r="5" fill="${theme.accent}" />
    `;
  }

  if (variant === 1) {
    return `
      <path d="M41 28 C40 18 72 18 71 28" stroke="${theme.shellDark}" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="41" cy="27" r="4" fill="${theme.accent}" />
      <circle cx="71" cy="27" r="4" fill="${theme.accent}" />
    `;
  }

  return `
    <path d="M56 28 L48 16" stroke="${theme.shellDark}" stroke-width="4" stroke-linecap="round" />
    <path d="M56 28 L64 16" stroke="${theme.shellDark}" stroke-width="4" stroke-linecap="round" />
    <circle cx="48" cy="14" r="4" fill="${theme.accent}" />
    <circle cx="64" cy="14" r="4" fill="${theme.accent}" />
  `;
};

const buildEyes = (variant, theme) => {
  if (variant === 0) {
    return `
      <circle cx="42" cy="57" r="7" fill="${theme.eye}" />
      <circle cx="70" cy="57" r="7" fill="${theme.eye}" />
      <circle cx="42" cy="57" r="3" fill="${theme.glow}" />
      <circle cx="70" cy="57" r="3" fill="${theme.glow}" />
    `;
  }

  if (variant === 1) {
    return `
      <rect x="33" y="49" width="18" height="14" rx="7" fill="${theme.eye}" />
      <rect x="61" y="49" width="18" height="14" rx="7" fill="${theme.eye}" />
      <rect x="38" y="54" width="8" height="4" rx="2" fill="${theme.glow}" />
      <rect x="66" y="54" width="8" height="4" rx="2" fill="${theme.glow}" />
    `;
  }

  return `
    <path d="M32 56 C36 48 48 48 52 56 C48 64 36 64 32 56Z" fill="${theme.eye}" />
    <path d="M60 56 C64 48 76 48 80 56 C76 64 64 64 60 56Z" fill="${theme.eye}" />
    <circle cx="42" cy="56" r="3" fill="${theme.glow}" />
    <circle cx="70" cy="56" r="3" fill="${theme.glow}" />
  `;
};

const buildMouth = (variant, theme) => {
  if (variant === 0) {
    return `
      <rect x="38" y="76" width="36" height="12" rx="6" fill="${theme.shellDark}" opacity="0.92" />
      <path d="M44 82 H68" stroke="${theme.glow}" stroke-width="3" stroke-linecap="round" />
    `;
  }

  if (variant === 1) {
    return `
      <path d="M42 82 C48 89 64 89 70 82" stroke="${theme.shellDark}" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M45 82 C50 86 62 86 67 82" stroke="${theme.glow}" stroke-width="2" fill="none" stroke-linecap="round" />
    `;
  }

  return `
    <rect x="40" y="77" width="32" height="10" rx="5" fill="${theme.shellDark}" />
    <path d="M46 82 H66" stroke="${theme.glow}" stroke-width="2.5" stroke-dasharray="3 4" stroke-linecap="round" />
  `;
};

const buildCheeks = (variant, theme) => {
  if (variant === 0) {
    return `
      <circle cx="26" cy="68" r="6" fill="${theme.accent}" opacity="0.55" />
      <circle cx="86" cy="68" r="6" fill="${theme.accent}" opacity="0.55" />
    `;
  }

  if (variant === 1) {
    return `
      <rect x="20" y="63" width="11" height="8" rx="4" fill="${theme.accent}" opacity="0.48" />
      <rect x="81" y="63" width="11" height="8" rx="4" fill="${theme.accent}" opacity="0.48" />
    `;
  }

  return `
    <path d="M22 67 H30" stroke="${theme.accent}" stroke-width="4" stroke-linecap="round" opacity="0.58" />
    <path d="M82 67 H90" stroke="${theme.accent}" stroke-width="4" stroke-linecap="round" opacity="0.58" />
  `;
};

const encodeSvgDataUri = (svg) => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return `data:image/svg+xml;base64,${window.btoa(svg)}`;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const buildAvatarSvg = (avatarSeed, fallbackSeed = "aurora-bot") => {
  const seed = hashSeed(avatarSeed || fallbackSeed);
  const theme = AVATAR_THEMES[seed % AVATAR_THEMES.length];
  const antennaVariant = seed % 3;
  const eyeVariant = Math.floor(seed / 3) % 3;
  const mouthVariant = Math.floor(seed / 5) % 3;
  const cheekVariant = Math.floor(seed / 7) % 3;
  const shellRadius = 28 + (seed % 7);
  const panelRadius = 18 + (seed % 4);
  const gradientId = buildGradientId(seed);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112" fill="none">
      <defs>
        <linearGradient id="${gradientId}" x1="10" y1="10" x2="102" y2="102" gradientUnits="userSpaceOnUse">
          <stop stop-color="${theme.bgA}" />
          <stop offset="1" stop-color="${theme.bgB}" />
        </linearGradient>
      </defs>
      <rect width="112" height="112" rx="32" fill="url(#${gradientId})" />
      <circle cx="56" cy="56" r="44" fill="#ffffff" opacity="0.14" />
      ${buildAntenna(antennaVariant, theme)}
      <rect x="18" y="30" width="76" height="64" rx="${shellRadius}" fill="${theme.shell}" />
      <rect x="24" y="36" width="64" height="28" rx="${panelRadius}" fill="${theme.shellDark}" opacity="0.92" />
      <rect x="28" y="67" width="56" height="18" rx="9" fill="#ffffff" opacity="0.22" />
      ${buildEyes(eyeVariant, theme)}
      ${buildMouth(mouthVariant, theme)}
      ${buildCheeks(cheekVariant, theme)}
      <path d="M30 47 C36 39 76 39 82 47" stroke="#ffffff" opacity="0.24" stroke-width="4" stroke-linecap="round" />
    </svg>
  `;
};

export const buildAvatarUrl = (avatarSeed, fallbackSeed = "aurora-bot", size = 96) => {
  const svg = buildAvatarSvg(avatarSeed, fallbackSeed, size);
  return encodeSvgDataUri(svg);
};
