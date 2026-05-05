import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaComments, FaGlobe, FaMagic, FaPlay } from "react-icons/fa";
import { AVATAR_OPTIONS, buildAvatarUrl } from "../../Utils/avatarOptions";
import { usePreferences } from "../../Context/usePreferences";
import "./HomePage.css";

const Reveal = ({ children, className = "", delay = 0, direction = "up" }) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`reveal reveal-${direction} ${isVisible ? "visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { copy } = usePreferences();
  const featuredAvatars = AVATAR_OPTIONS.slice(0, 8);
  const featuredMetrics = copy.home.metrics.slice(0, 3);
  const featuredCards = [
    {
      icon: <FaComments />,
      eyebrow: copy.sidebar.people,
      title: copy.home.features[0]?.title,
      text: copy.home.features[0]?.copy,
    },
    {
      icon: <FaMagic />,
      eyebrow: copy.common.appearance,
      title: copy.home.features[1]?.title,
      text: copy.home.features[1]?.copy,
    },
    {
      icon: <FaGlobe />,
      eyebrow: copy.common.language,
      title: copy.home.features[4]?.title || copy.settings.languageTitle,
      text: copy.home.features[4]?.copy || copy.settings.languageCopy,
    },
  ];

  const handlePrimaryAction = () => {
    navigate(token ? "/chat" : "/signup");
  };

  return (
    <div className="home-screen">
      <div className="home-shell">
        <section className="home-hero">
          <Reveal className="home-hero-copy" direction="left">
            <div className="home-kicker">{copy.home.kicker}</div>
            <h1>{copy.home.title}</h1>
            <p>{copy.home.description}</p>

            <div className="home-hero-actions">
              <button
                type="button"
                className="home-primary-button"
                onClick={handlePrimaryAction}
              >
                <FaPlay />
                <span>{token ? copy.home.primarySignedIn : copy.home.primarySignedOut}</span>
              </button>

              <Link to={token ? "/chat" : "/signin"} className="home-secondary-button">
                <span>
                  {token ? copy.home.secondarySignedIn : copy.home.secondarySignedOut}
                </span>
                <FaArrowRight />
              </Link>
            </div>

            <div className="home-hero-support">
              {copy.home.support.map((item, index) => (
                <Reveal
                  key={item}
                  className="home-support-pill"
                  delay={120 + index * 80}
                  direction={index % 2 === 0 ? "up" : "right"}
                >
                  {item}
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal className="home-hero-visual" direction="right" delay={80}>
            <div className="home-device-frame">
              <div className="home-device-topbar">
                <span className="home-device-dot"></span>
                <span className="home-device-dot"></span>
                <span className="home-device-dot"></span>
              </div>

              <div className="home-device-body">
                <div className="home-device-sidebar">
                  {featuredAvatars.slice(0, 4).map((avatar, index) => (
                    <div
                      key={avatar.id}
                      className={`home-sidebar-card home-sidebar-card-${index + 1}`}
                    >
                      <img src={buildAvatarUrl(avatar.id, avatar.id, 88)} alt={avatar.name} />
                      <div>
                        <strong>{avatar.name}</strong>
                        <span>{avatar.series}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="home-device-chat">
                  <div className="home-message-row">
                    <div className="home-message-bubble">{copy.chat.placeholderReady}</div>
                  </div>
                  <div className="home-message-row own">
                    <div className="home-message-bubble own">{copy.home.orbitLabels[0]}</div>
                  </div>
                  <div className="home-message-row">
                    <div className="home-message-bubble accent">{copy.home.orbitLabels[1]}</div>
                  </div>
                  <div className="home-message-row own">
                    <div className="home-message-bubble own">{copy.home.orbitLabels[2]}</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="home-metric-grid">
          {featuredMetrics.map((metric, index) => (
            <Reveal key={metric.value} delay={index * 70} direction="up">
              <article className="home-metric-card">
                <strong>{metric.value}</strong>
                <p>{metric.label}</p>
              </article>
            </Reveal>
          ))}
        </section>

        <section className="home-feature-grid">
          {featuredCards.map((card, index) => (
            <Reveal
              key={card.title}
              delay={index * 90}
              direction={index === 1 ? "up" : index === 2 ? "right" : "left"}
            >
              <article className="home-feature-card">
                <div className="home-feature-icon">{card.icon}</div>
                <span className="home-feature-label">{card.eyebrow}</span>
                <strong>{card.title}</strong>
                <p>{card.text}</p>
              </article>
            </Reveal>
          ))}
        </section>

        <section className="home-avatar-rail">
          <Reveal className="home-avatar-rail-copy" direction="left">
            <div className="home-panel-kicker">{copy.auth.signup.currentPick}</div>
            <h2>{copy.auth.signup.cardTitle}</h2>
            <p>{copy.auth.signup.description}</p>
          </Reveal>

          <div className="home-avatar-grid">
            {featuredAvatars.map((avatar, index) => (
              <Reveal
                key={avatar.id}
                delay={index * 80}
                direction={index % 2 === 0 ? "up" : "down"}
              >
                <article className="home-avatar-card">
                  <span className="home-avatar-series">{avatar.series}</span>
                  <img
                    src={buildAvatarUrl(avatar.id, avatar.id, 120)}
                    alt={avatar.name}
                    className="home-avatar-thumb"
                  />
                  <strong>{avatar.name}</strong>
                  <p>{avatar.mood}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
