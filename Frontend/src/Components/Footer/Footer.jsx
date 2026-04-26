import { usePreferences } from "../../Context/usePreferences";
import "./Footer.css";

const Footer = () => {
  const { copy, theme, language, languageOptions } = usePreferences();
  const activeLanguage =
    languageOptions.find((option) => option.id === language)?.label || language;

  return (
    <footer className="space-footer-shell">
      <div className="space-footer">
        <div className="space-footer-copy">
          <strong>{copy.common.appName}</strong>
          <span>{copy.footer.line}</span>
        </div>

        <div className="space-footer-meta">
          <span>{theme === "dark" ? copy.common.dark : copy.common.light}</span>
          <span>{activeLanguage}</span>
          <span>
            &copy; {new Date().getFullYear()} {copy.footer.rights}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

