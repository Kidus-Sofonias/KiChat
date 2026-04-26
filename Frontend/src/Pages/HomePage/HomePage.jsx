import { Link, useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaCog,
  FaLink,
  FaMicrophone,
  FaPaperPlane,
  FaRobot,
  FaVideo,
} from "react-icons/fa";
import { AVATAR_OPTIONS, buildAvatarUrl } from "../../Utils/avatarOptions";
import { usePreferences } from "../../Context/usePreferences";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { copy } = usePreferences();

  const featureIcons = [
    <FaBolt key="bolt" />,
    <FaVideo key="video" />,
    <FaMicrophone key="mic" />,
    <FaLink key="link" />,
    <FaRobot key="robot" />,
    <FaPaperPlane key="plane" />,
  ];

  const handlePrimaryAction = () => {
    navigate(token ? "/chat" : "/signup");
  };

  return (
    <div className="home-screen">
      <div className="home-shell">
        <section className="home-hero">
          <div className="home-hero-copy">
            <div className="home-kicker">{copy.home.kicker}</div>
            <h1>{copy.home.title}</h1>
            <p>{copy.home.description}</p>

            <div className="home-hero-actions">
              <button
                type="button"
                className="home-primary-button"
                onClick={handlePrimaryAction}
              >
                {token ? copy.home.primarySignedIn : copy.home.primarySignedOut}
              </button>
              <Link
                to={token ? "/chat" : "/signin"}
                className="home-secondary-button"
              >
                {token
                  ? copy.home.secondarySignedIn
                  : copy.home.secondarySignedOut}
              </Link>
              <Link to="/settings" className="home-secondary-button">
                <FaCog />
                <span>{copy.common.settings}</span>
              </Link>
            </div>

            <ul className="home-hero-support">
              {copy.home.support.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="home-hero-visual">
            <div className="home-orbit">
              <div className="home-orbit-ring"></div>
              <div className="home-orbit-ring-alt"></div>
              <div className="home-orbit-center">
                <img
                  src={buildAvatarUrl(
                    AVATAR_OPTIONS[0].id,
                    AVATAR_OPTIONS[0].id,
                    280
                  )}
                  alt={AVATAR_OPTIONS[0].name}
                />
              </div>
              <div className="home-orbit-chip top">
                <img
                  src={buildAvatarUrl(
                    AVATAR_OPTIONS[1].id,
                    AVATAR_OPTIONS[1].id,
                    80
                  )}
                  alt={AVATAR_OPTIONS[1].name}
                />
                <span>{copy.home.orbitLabels[0]}</span>
              </div>
              <div className="home-orbit-chip left">
                <img
                  src={buildAvatarUrl(
                    AVATAR_OPTIONS[3].id,
                    AVATAR_OPTIONS[3].id,
                    80
                  )}
                  alt={AVATAR_OPTIONS[3].name}
                />
                <span>{copy.home.orbitLabels[1]}</span>
              </div>
              <div className="home-orbit-chip bottom">
                <img
                  src={buildAvatarUrl(
                    AVATAR_OPTIONS[6].id,
                    AVATAR_OPTIONS[6].id,
                    80
                  )}
                  alt={AVATAR_OPTIONS[6].name}
                />
                <span>{copy.home.orbitLabels[2]}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-metric-grid">
          {copy.home.metrics.map((metric) => (
            <article key={metric.value} className="home-metric-card">
              <strong>{metric.value}</strong>
              <p>{metric.label}</p>
            </article>
          ))}
        </section>

        <section className="home-feature-grid">
          {copy.home.features.map((feature, index) => (
            <article key={feature.title} className="home-feature-card">
              <div className="home-feature-icon">{featureIcons[index]}</div>
              <strong>{feature.title}</strong>
              <p>{feature.copy}</p>
            </article>
          ))}
        </section>

        <section className="home-panel">
          <div className="home-panel-layout">
            <div className="home-panel-content">
              <div className="home-panel-kicker">{copy.home.panelKicker}</div>
              <h2>{copy.home.panelTitle}</h2>
              <p>{copy.home.panelDescription}</p>

              <div className="home-panel-list">
                {copy.home.panelList.map((item, index) => (
                  <div key={item.title} className="home-panel-list-item">
                    <div className="home-panel-badge">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-panel-card">
              <strong>{copy.home.panelCardTitle}</strong>
              <ul>
                {copy.home.panelCardItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/settings" className="home-text-link">
                {copy.home.panelLink}
              </Link>
            </div>
          </div>
        </section>

        <section className="home-step-grid">
          {copy.home.steps.map((step) => (
            <article key={step.number} className="home-step-card">
              <div className="home-step-number">{step.number}</div>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </article>
          ))}
        </section>

        <section className="home-avatar-grid">
          {AVATAR_OPTIONS.slice(0, 6).map((avatar) => (
            <article key={avatar.id} className="home-avatar-card">
              <img
                src={buildAvatarUrl(avatar.id, avatar.id, 120)}
                alt={avatar.name}
                className="home-avatar-thumb"
              />
              <strong>{avatar.name}</strong>
              <p>{avatar.mood}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default HomePage;

