const getFirefoxVersion = (userAgent) => {
  const match = userAgent.match(/Firefox\/(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const getBrowserCapabilities = () => {
  if (typeof window === "undefined") {
    return {
      browserName: "unknown",
      browserVersion: null,
      supportsLocalStorage: true,
      supportsBackdropFilter: true,
      supportsCssVariables: true,
      supportsVoiceRecording: true,
      supportsWebSockets: true,
      supportsFormData: true,
      supportsFileReader: true,
      supportsSmoothScroll: true,
      supportsModernModules: true,
      isLegacyFirefox: false,
      shouldUseLegacyExperience: false,
      compatibilityNotes: [],
    };
  }

  const userAgent = window.navigator.userAgent || "";
  const firefoxVersion = getFirefoxVersion(userAgent);
  const browserName = firefoxVersion ? "firefox" : "other";
  const supportsCss = typeof window.CSS !== "undefined" && typeof window.CSS.supports === "function";
  const supportsBackdropFilter =
    supportsCss &&
    (window.CSS.supports("backdrop-filter", "blur(8px)") ||
      window.CSS.supports("-webkit-backdrop-filter", "blur(8px)"));
  const supportsCssVariables =
    supportsCss && window.CSS.supports("--legacy-test", "0");
  const supportsVoiceRecording =
    typeof window.MediaRecorder !== "undefined" &&
    !!window.navigator.mediaDevices?.getUserMedia;
  const supportsWebSockets = typeof window.WebSocket !== "undefined";
  const supportsFormData = typeof window.FormData !== "undefined";
  const supportsFileReader = typeof window.FileReader !== "undefined";
  const supportsSmoothScroll =
    typeof document !== "undefined" &&
    "scrollBehavior" in document.documentElement.style;
  const supportsModernModules = "noModule" in document.createElement("script");
  const isLegacyFirefox = !!firefoxVersion && firefoxVersion <= 52;
  const compatibilityNotes = [];

  if (!supportsVoiceRecording) {
    compatibilityNotes.push("Voice recording will be disabled.");
  }

  if (!supportsBackdropFilter) {
    compatibilityNotes.push("Glass blur effects will fall back to solid panels.");
  }

  if (!supportsModernModules) {
    compatibilityNotes.push("This browser needs a legacy JavaScript bundle.");
  }

  if (!supportsFormData || !supportsFileReader) {
    compatibilityNotes.push("File uploads may not work reliably.");
  }

  return {
    browserName,
    browserVersion: firefoxVersion,
    supportsLocalStorage: typeof window.localStorage !== "undefined",
    supportsBackdropFilter,
    supportsCssVariables,
    supportsVoiceRecording,
    supportsWebSockets,
    supportsFormData,
    supportsFileReader,
    supportsSmoothScroll,
    supportsModernModules,
    isLegacyFirefox,
    shouldUseLegacyExperience:
      isLegacyFirefox ||
      !supportsBackdropFilter ||
      !supportsVoiceRecording ||
      !supportsModernModules,
    compatibilityNotes,
  };
};
