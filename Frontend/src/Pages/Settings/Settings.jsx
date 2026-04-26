import { FaArrowLeft, FaGlobe, FaMoon, FaRobot, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import { usePreferences } from "../../Context/usePreferences";
import { userProvider } from "../../Context/UserContext";
import "./Settings.css";

const Settings = () => {
  const { copy, theme, setTheme, language, setLanguage, themeOptions, languageOptions } =
    usePreferences();
  const [user] = useContext(userProvider);

  return (
    <div className="settings-screen">
      <div className="settings-shell">
        <section className="settings-hero">
          <div className="settings-hero-copy">
            <div className="settings-kicker">{copy.settings.badge}</div>
            <h1>{copy.settings.title}</h1>
            <p>{copy.settings.description}</p>

            <div className="settings-hero-actions">
              <Link to={user?.user_name ? "/chat" : "/"} className="settings-link-button primary">
                <FaArrowLeft />
                <span>
                  {user?.user_name ? copy.settings.backChat : copy.settings.backHome}
                </span>
              </Link>
              <Link to="/" className="settings-link-button">
                <FaRobot />
                <span>{copy.common.home}</span>
              </Link>
            </div>
          </div>

          <div className="settings-hero-side">
            <div className="settings-status-pill">{copy.common.saveChanges}</div>
            <img
              src={buildAvatarUrl(user?.avatar_seed, user?.user_name || "orbit-one", 220)}
              alt="Settings robot avatar"
              className="settings-hero-robot"
            />
            <div className="settings-status-pill">
              {theme === "dark"
                ? copy.settings.themes.dark.title
                : copy.settings.themes.light.title}
            </div>
          </div>
        </section>

        <section className="settings-grid">
          <article className="settings-card">
            <div className="settings-card-header">
              <h2>{copy.settings.appearanceTitle}</h2>
              <p>{copy.settings.appearanceCopy}</p>
            </div>

            <div className="settings-choice-list">
              {themeOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`settings-choice ${theme === option.id ? "active" : ""}`}
                  onClick={() => setTheme(option.id)}
                >
                  <div className="settings-choice-icon">
                    {option.id === "dark" ? <FaMoon /> : <FaSun />}
                  </div>
                  <div className="settings-choice-copy">
                    <strong>{copy.settings.themes[option.id].title}</strong>
                    <span>{copy.settings.themes[option.id].copy}</span>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="settings-card">
            <div className="settings-card-header">
              <h2>{copy.settings.languageTitle}</h2>
              <p>{copy.settings.languageCopy}</p>
            </div>

            <div className="settings-choice-list">
              {languageOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`settings-choice ${language === option.id ? "active" : ""}`}
                  onClick={() => setLanguage(option.id)}
                >
                  <div className="settings-choice-icon">
                    <FaGlobe />
                  </div>
                  <div className="settings-choice-copy">
                    <strong>{copy.settings.languages[option.id].title}</strong>
                    <span>{copy.settings.languages[option.id].copy}</span>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="settings-card">
            <div className="settings-card-header">
              <h2>{copy.settings.effectsTitle}</h2>
              <p>{copy.settings.effectsCopy}</p>
            </div>

            <div className="settings-effects-note">
              <strong>{copy.settings.effectsBadge}</strong>
              <span>{copy.settings.effectsNote}</span>
            </div>

            <button type="button" className="settings-chip-button">
              <FaRobot />
              <span>{copy.common.appName}</span>
            </button>
          </article>
        </section>

        <section className="settings-preview-card">
          <div className="settings-card-header">
            <h2>{copy.settings.previewTitle}</h2>
            <p>{copy.settings.previewCopy}</p>
          </div>

          <div className="settings-preview-layout">
            <div className="settings-preview-panel">
              <div className="settings-preview-panel-header">
                <img
                  src={buildAvatarUrl("orbit-one", "orbit-one", 120)}
                  alt="Preview robot avatar"
                />
                <div>
                  <strong>{copy.common.appName}</strong>
                  <div>
                    {theme === "dark"
                      ? copy.chat.themeStatusDark
                      : copy.chat.themeStatusLight}
                  </div>
                </div>
              </div>

              <div className="settings-preview-bubbles">
                <div className="settings-preview-bubble">
                  {copy.chat.placeholderReady}
                </div>
                <div className="settings-preview-bubble own">
                  {copy.settings.previewPrimary}
                </div>
              </div>
            </div>

            <div className="settings-preview-side">
              <strong>{copy.common.appearance}</strong>
              <span>{theme === "dark" ? copy.common.dark : copy.common.light}</span>
              <strong>{copy.common.language}</strong>
              <span>{copy.settings.languages[language].title}</span>

              <div className="settings-preview-actions">
                <button type="button" className="settings-link-button primary">
                  {copy.settings.previewPrimary}
                </button>
                <button type="button" className="settings-link-button">
                  {copy.settings.previewSecondary}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;

