import { useContext } from "react";
import {
  FaCog,
  FaMoon,
  FaRobot,
  FaRocket,
  FaSignOutAlt,
  FaSun,
} from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import { userProvider } from "../../Context/UserContext";
import { usePreferences } from "../../Context/usePreferences";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import "./Header.css";

const Header = ({ logOut }) => {
  const [user] = useContext(userProvider);
  const { theme, toggleTheme, copy, language, languageOptions } = usePreferences();
  const isSignedIn = Boolean(user?.user_name);
  const activeLanguage =
    languageOptions.find((option) => option.id === language)?.label || language;

  return (
    <header className="space-nav-shell">
      <nav className="space-nav">
        <Link to="/" className="space-nav-brand">
          <div className="space-nav-brand-mark">
            <FaRobot />
          </div>
          <div className="space-nav-brand-copy">
            <strong>{copy.common.appName}</strong>
            <span>{copy.header.tagline}</span>
          </div>
        </Link>

        <div className="space-nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `space-nav-link ${isActive ? "active" : ""}`
            }
          >
            <FaRocket />
            <span>{copy.common.home}</span>
          </NavLink>

          {isSignedIn && (
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `space-nav-link ${isActive ? "active" : ""}`
              }
            >
              <FaRobot />
              <span>{copy.common.chat}</span>
            </NavLink>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `space-nav-link ${isActive ? "active" : ""}`
            }
          >
            <FaCog />
            <span>{copy.header.settings}</span>
          </NavLink>
        </div>

        <div className="space-nav-actions">
          <div className="space-nav-language">{activeLanguage}</div>

          <button
            type="button"
            className="space-nav-action compact"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? copy.common.light : copy.common.dark}
            title={theme === "dark" ? copy.common.light : copy.common.dark}
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

          {isSignedIn ? (
            <>
              <Link to="/chat" className="space-nav-avatar-link">
                <img
                  src={buildAvatarUrl(user.avatar_seed, user.user_name, 80)}
                  alt={`${user.user_name} avatar`}
                />
                <strong>{user.user_name}</strong>
              </Link>

              <button
                type="button"
                className="space-nav-action"
                onClick={logOut}
              >
                <FaSignOutAlt />
                <span>{copy.common.signOut}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="space-nav-action">
                <span>{copy.common.signIn}</span>
              </Link>
              <Link to="/signup" className="space-nav-action primary">
                <FaRocket />
                <span>{copy.header.create}</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

