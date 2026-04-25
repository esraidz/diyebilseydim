import { useState, useEffect } from "react";
import { CARD_COLORS, MOODS } from "../constants";

/* ── Animated Counter ── */
function AnimatedCount({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

/* ── Pure CSS Donut Chart ── */
function DonutChart({ data, total }) {
  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = total > 0 ? (d.count / total) * 100 : 0;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  /* build conic-gradient */
  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ");

  return (
    <div className="donut-wrap">
      <div
        className="donut"
        style={{
          background: `conic-gradient(${gradient || "#333 0% 100%"})`,
        }}
      >
        <div className="donut-hole">
          <span className="donut-total">
            <AnimatedCount target={total} />
          </span>
          <span className="donut-label">mesaj</span>
        </div>
      </div>
      <div className="donut-legend">
        {segments
          .filter((s) => s.pct > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
          .map((s) => (
            <div key={s.id} className="legend-item">
              <span
                className="legend-dot"
                style={{ background: s.color }}
              />
              <span className="legend-name">{s.label}</span>
              <span className="legend-count">{s.count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ── Horizontal Bar Chart ── */
function BarChart({ data, max }) {
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.id} className="bar-row">
          <span className="bar-emoji">{d.emoji}</span>
          <span className="bar-label">{d.label}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: max > 0 ? `${(d.count / max) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="bar-count">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsModal({ open, onClose, messages }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 280);
  };

  if (!open) return null;

  const total = messages.length;

  /* ── color distribution ── */
  const colorCounts = CARD_COLORS.map((c) => ({
    ...c,
    color: c.bg,
    count: messages.filter((m) => m.card_color === c.id).length,
  }));

  /* ── mood distribution ── */
  const moodCounts = MOODS.map((m) => ({
    ...m,
    count: messages.filter((msg) => msg.mood === m.id).length,
  }));
  const maxMood = Math.max(...moodCounts.map((m) => m.count), 1);

  /* ── top names ── */
  const nameCounts = {};
  messages.forEach((m) => {
    if (m.to_name) {
      const name = m.to_name.toLowerCase().trim();
      nameCounts[name] = (nameCounts[name] || 0) + 1;
    }
  });
  const topNames = Object.entries(nameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* ── this week vs last week ── */
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const thisWeek = messages.filter(
    (m) => new Date(m.created_at) >= weekAgo
  ).length;
  const lastWeek = messages.filter(
    (m) =>
      new Date(m.created_at) >= twoWeeksAgo &&
      new Date(m.created_at) < weekAgo
  ).length;

  return (
    <>
      <div className="overlay" onClick={handleClose} />

      <div className={`stats-modal${closing ? " closing" : ""}`}>
        <button
          className="stats-close"
          onClick={handleClose}
          aria-label="Kapat"
        >
          ✕
        </button>

        <div className="stats-content">
          <h2 className="stats-title">
            topluluk ne hissediyor? <span className="stats-title-emoji">📊</span>
          </h2>
          <div className="stats-divider" />

          {/* big number */}
          <div className="stats-hero">
            <div className="stats-hero-number">
              <AnimatedCount target={total} duration={1600} />
            </div>
            <p className="stats-hero-label">söylenmemiş şey</p>
          </div>

          {/* weekly comparison */}
          <div className="stats-weekly">
            <div className="stats-week-box">
              <span className="stats-week-num">{thisWeek}</span>
              <span className="stats-week-label">bu hafta</span>
            </div>
            <div className="stats-week-vs">vs</div>
            <div className="stats-week-box">
              <span className="stats-week-num">{lastWeek}</span>
              <span className="stats-week-label">geçen hafta</span>
            </div>
          </div>

          {/* color donut */}
          <div className="stats-section">
            <h3 className="stats-section-title">🎨 renk dağılımı</h3>
            <DonutChart data={colorCounts} total={total} />
          </div>

          {/* mood bars */}
          <div className="stats-section">
            <h3 className="stats-section-title">💭 mood dağılımı</h3>
            {moodCounts.some((m) => m.count > 0) ? (
              <BarChart data={moodCounts} max={maxMood} />
            ) : (
              <p className="stats-empty">henüz mood verisi yok</p>
            )}
          </div>

          {/* top names */}
          {topNames.length > 0 && (
            <div className="stats-section">
              <h3 className="stats-section-title">💌 en çok yazılan</h3>
              <div className="stats-names">
                {topNames.map(([name, count], i) => (
                  <div key={name} className="stats-name-row">
                    <span className="stats-name-rank">
                      {i === 0 ? "👑" : `${i + 1}.`}
                    </span>
                    <span className="stats-name-text">{name}</span>
                    <span className="stats-name-count">{count} mesaj</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
