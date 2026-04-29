import { useEffect, useMemo, useState } from "react";
import { APP_COPY, LANGUAGE_OPTIONS, THEME_OPTIONS } from "../Utils/copy";
import { PreferencesContext } from "./PreferencesStore";

const PREFERENCES_STORAGE_KEY = "kichat_preferences";

const defaultPreferences = {
  theme: "dark",
  language: "en",
};

const loadStoredPreferences = () => {
  let savedPreferences = null;

  try {
    savedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to read preferences from storage:", error);
    return defaultPreferences;
  }

  if (!savedPreferences) {
    return defaultPreferences;
  }

  try {
    return {
      ...defaultPreferences,
      ...JSON.parse(savedPreferences),
    };
  } catch (error) {
    console.error("Failed to parse preferences from storage:", error);
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    return defaultPreferences;
  }
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() =>
    typeof window === "undefined" ? defaultPreferences : loadStoredPreferences()
  );

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save preferences to storage:", error);
    }

    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.lang = preferences.language;
  }, [preferences]);

  const copy = useMemo(
    () => APP_COPY[preferences.language] || APP_COPY.en,
    [preferences.language]
  );

  const value = useMemo(
    () => ({
      ...preferences,
      copy,
      languageOptions: LANGUAGE_OPTIONS,
      themeOptions: THEME_OPTIONS,
      setTheme: (theme) =>
        setPreferences((current) => ({
          ...current,
          theme,
        })),
      toggleTheme: () =>
        setPreferences((current) => ({
          ...current,
          theme: current.theme === "dark" ? "light" : "dark",
        })),
      setLanguage: (language) =>
        setPreferences((current) => ({
          ...current,
          language,
        })),
    }),
    [copy, preferences]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
