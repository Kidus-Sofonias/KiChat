import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaRocket, FaStar } from "react-icons/fa";
import { usePreferences } from "../../Context/usePreferences";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { copy } = usePreferences();

  const actionLabel = token ? copy.home.primarySignedIn : copy.home.primarySignedOut;
  const secondaryLabel = token ? copy.home.secondarySignedIn : copy.home.secondarySignedOut;
  const featureCards = [
    {
      title: copy.home.features?.[0]?.title || "Fast conversations",
      description: copy.home.features?.[0]?.copy || "Ask things naturally and get answers in seconds.",
      accent: "#6bdcff",
    },
    {
      title: copy.home.features?.[1]?.title || "Personal style",
      description: copy.home.features?.[1]?.copy || "Choose your robot persona and make every chat feel unique.",
      accent: "#ff98c4",
    },
    {
      title: copy.home.features?.[4]?.title || copy.settings?.languageTitle || "Multilingual support",
      description: copy.home.features?.[4]?.copy || copy.settings?.languageCopy || "Switch languages instantly and stay connected.",
      accent: "#a179ff",
    },
  ];

  const highlightPills = copy.home.support?.slice(0, 4) || [copy.common.appearance, copy.common.language, copy.sidebar.people];

  return (
    <div className="home-screen page-shell">
      <section className="home-hero glass-panel">
        <div className="home-hero-copy">
          <span className="home-label">{copy.home.kicker || "AI Companion"}</span>
          <h1>{copy.home.title || "Meet your robot companion."}</h1>
          <p>{copy.home.description || "A clean, futuristic chat experience with subtle 3D motion and a black hole backdrop."}</p>

          <div className="hero-actions">
            <button type="button" className="hero-button primary" onClick={() => navigate(token ? "/chat" : "/signup")}>
              <FaRocket />
              <span>{actionLabel}</span>
            </button>
            <Link to={token ? "/chat" : "/signin"} className="hero-button secondary">
              <span>{secondaryLabel}</span>
              <FaArrowRight />
            </Link>
          </div>

          <div className="home-pill-grid">
            {highlightPills.map((pill, index) => (
              <div key={pill + index} className="home-pill">
                <FaStar />
                <span>{pill}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="robot-orbit">
            <div className="robot-glow" />
            <div className="robot-core">
              <div className="robot-eye" />
            </div>
            <div className="robot-ring robot-ring-1" />
            <div className="robot-ring robot-ring-2" />
            <div className="robot-ring robot-ring-3" />
          </div>
        </div>
      </section>

      <section className="home-features glass-panel">
        <div className="home-features-header">
          <span>Why choose KiChat?</span>
          <h2>{copy.home.title || "An intelligent, polished robot UI."}</h2>
        </div>

        <div className="feature-grid">
          {featureCards.map((card) => (
            <article key={card.title} className="feature-card">
              <div className="feature-tag" style={{ background: card.accent }} />
              <strong>{card.title}</strong>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
