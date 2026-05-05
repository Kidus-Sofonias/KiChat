import { useMemo } from "react";

const randomBetween = (min, max) => min + Math.random() * (max - min);
const pick = (items) => items[Math.floor(Math.random() * items.length)];

const buildStars = (count, palette) =>
  Array.from({ length: count }, (_, index) => ({
    id: `star-${index}-${Math.round(randomBetween(100, 999))}`,
    top: `${randomBetween(0, 100).toFixed(2)}%`,
    left: `${randomBetween(0, 100).toFixed(2)}%`,
    size: randomBetween(1, 4.4),
    delay: `${randomBetween(0, 8).toFixed(2)}s`,
    duration: `${randomBetween(8, 18).toFixed(2)}s`,
    opacity: randomBetween(0.24, 0.88),
    hue: pick(palette),
  }));

const buildConstellation = (id) => {
  const width = randomBetween(180, 320);
  const height = randomBetween(120, 220);
  const pointCount = Math.floor(randomBetween(4, 7));
  const points = Array.from({ length: pointCount }, () => [
    `${randomBetween(8, 92).toFixed(2)}%`,
    `${randomBetween(12, 88).toFixed(2)}%`,
  ]).sort((leftPoint, rightPoint) => Number(leftPoint[0].replace("%", "")) - Number(rightPoint[0].replace("%", "")));

  return {
    id,
    top: `${randomBetween(6, 76).toFixed(2)}%`,
    left: `${randomBetween(4, 74).toFixed(2)}%`,
    width: `${width.toFixed(0)}px`,
    height: `${height.toFixed(0)}px`,
    rotate: `${randomBetween(-16, 16).toFixed(2)}deg`,
    opacity: randomBetween(0.22, 0.56),
    points,
  };
};

const buildChip = (id) => ({
  id,
  top: Math.random() > 0.5 ? `${randomBetween(4, 74).toFixed(2)}%` : undefined,
  left: Math.random() > 0.5 ? `${randomBetween(4, 72).toFixed(2)}%` : undefined,
  right: Math.random() > 0.5 ? `${randomBetween(4, 28).toFixed(2)}%` : undefined,
  bottom: Math.random() > 0.5 ? `${randomBetween(4, 28).toFixed(2)}%` : undefined,
  rotate: `${randomBetween(-24, 24).toFixed(2)}deg`,
  size: `${randomBetween(120, 220).toFixed(0)}px`,
  opacity: randomBetween(0.18, 0.44),
});

const buildBlackhole = (id) => ({
  id,
  top: Math.random() > 0.5 ? `${randomBetween(-4, 58).toFixed(2)}%` : undefined,
  left: Math.random() > 0.5 ? `${randomBetween(-4, 62).toFixed(2)}%` : undefined,
  right: Math.random() > 0.5 ? `${randomBetween(-4, 30).toFixed(2)}%` : undefined,
  bottom: Math.random() > 0.5 ? `${randomBetween(-8, 20).toFixed(2)}%` : undefined,
  size: `${randomBetween(220, 420).toFixed(0)}px`,
  ringTilt: `${randomBetween(-18, 18).toFixed(2)}deg`,
  pulse: `${randomBetween(18, 32).toFixed(2)}s`,
});

const buildNebulaField = () => ({
  leftX: `${randomBetween(10, 40).toFixed(2)}%`,
  leftY: `${randomBetween(10, 55).toFixed(2)}%`,
  rightX: `${randomBetween(55, 88).toFixed(2)}%`,
  rightY: `${randomBetween(10, 76).toFixed(2)}%`,
});

const buildScene = (isLegacy) => ({
  starsPrimary: buildStars(isLegacy ? 36 : 72, ["#ffffff", "#dff1ff", "#cfe2ff"]),
  starsSecondary: buildStars(isLegacy ? 18 : 44, ["#ffd4a3", "#bde2ff", "#ffffff"]),
  constellations: Array.from({ length: isLegacy ? 1 : 3 }, (_, index) =>
    buildConstellation(`constellation-${index}`)
  ),
  chips: Array.from({ length: isLegacy ? 1 : 4 }, (_, index) => buildChip(`chip-${index}`)),
  blackholes: Array.from({ length: isLegacy ? 1 : 3 }, (_, index) =>
    buildBlackhole(`blackhole-${index}`)
  ),
  nebula: buildNebulaField(),
});

const CosmicBackdrop = ({ browserSupport }) => {
  const shouldUseLegacyExperience = browserSupport?.shouldUseLegacyExperience;
  const scene = useMemo(() => buildScene(shouldUseLegacyExperience), [shouldUseLegacyExperience]);

  return (
    <div className="cosmic-backdrop" aria-hidden="true">
      {!shouldUseLegacyExperience && (
        <>
          <div className="cosmic-blackhole-layer">
            {scene.blackholes.map((hole) => (
              <div
                key={hole.id}
                className="cosmic-blackhole"
                style={{
                  top: hole.top,
                  left: hole.left,
                  right: hole.right,
                  bottom: hole.bottom,
                  width: hole.size,
                  height: hole.size,
                  ["--blackhole-tilt"]: hole.ringTilt,
                  ["--blackhole-pulse"]: hole.pulse,
                }}
              />
            ))}
          </div>

          <div
            className="cosmic-nebula cosmic-nebula-left"
            style={{
              ["--nebula-x"]: scene.nebula.leftX,
              ["--nebula-y"]: scene.nebula.leftY,
            }}
          />
          <div
            className="cosmic-nebula cosmic-nebula-right"
            style={{
              ["--nebula-x"]: scene.nebula.rightX,
              ["--nebula-y"]: scene.nebula.rightY,
            }}
          />
        </>
      )}

      <div className="cosmic-stars-layer cosmic-stars-primary">
        {scene.starsPrimary.map((star) => (
          <span
            key={star.id}
            className="cosmic-star"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
              background: `radial-gradient(circle, ${star.hue}, rgba(123, 214, 255, 0.28))`,
            }}
          />
        ))}
      </div>

      <div className="cosmic-stars-layer cosmic-stars-secondary">
        {scene.starsSecondary.map((star) => (
          <span
            key={star.id}
            className="cosmic-star secondary"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
              background: `radial-gradient(circle, ${star.hue}, rgba(255, 214, 162, 0.22))`,
            }}
          />
        ))}
      </div>

      {!shouldUseLegacyExperience && (
        <>
          <div className="cosmic-constellation-layer">
            {scene.constellations.map((constellation) => (
              <div
                key={constellation.id}
                className="cosmic-constellation"
                style={{
                  top: constellation.top,
                  left: constellation.left,
                  width: constellation.width,
                  height: constellation.height,
                  transform: `rotate(${constellation.rotate})`,
                  opacity: constellation.opacity,
                }}
              >
                {constellation.points.map((point, index) => (
                  <span
                    key={`${constellation.id}-${index}`}
                    className="cosmic-constellation-point"
                    style={{ top: point[1], left: point[0] }}
                  />
                ))}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    points={constellation.points
                      .map((point) => `${point[0].replace("%", "")},${point[1].replace("%", "")}`)
                      .join(" ")}
                  />
                </svg>
              </div>
            ))}
          </div>

          <div className="cosmic-chip-layer">
            {scene.chips.map((chip) => (
              <div
                key={chip.id}
                className="cosmic-chip-art"
                style={{
                  top: chip.top,
                  left: chip.left,
                  right: chip.right,
                  bottom: chip.bottom,
                  width: chip.size,
                  height: chip.size,
                  transform: `rotate(${chip.rotate})`,
                  opacity: chip.opacity,
                }}
              />
            ))}
          </div>

          <div className="cosmic-grid" />
          <div className="cosmic-scanline" />
        </>
      )}
    </div>
  );
};

export default CosmicBackdrop;
