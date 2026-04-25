import { CARD_COLORS, MOODS } from "../constants";

export default function ColorFilter({
  activeColor,
  onColorChange,
  activeMood,
  onMoodChange,
}) {
  return (
    <div className="filter-section fade-up" style={{ animationDelay: "0.18s" }}>
      {/* color dots */}
      <div className="filter-row">
        <button
          className={`filter-dot filter-dot-all${!activeColor ? " active" : ""}`}
          onClick={() => onColorChange(null)}
          title="tümü"
          aria-label="Tüm renkler"
        >
          <span className="filter-dot-rainbow" />
        </button>
        {CARD_COLORS.map((c) => (
          <button
            key={c.id}
            className={`filter-dot${activeColor === c.id ? " active" : ""}`}
            onClick={() => onColorChange(activeColor === c.id ? null : c.id)}
            title={c.label}
            aria-label={`Filtre: ${c.label}`}
            style={{ "--dot-bg": c.bg, "--dot-ink": c.ink }}
          />
        ))}
      </div>

      {/* mood chips */}
      <div className="filter-row filter-mood-row">
        <button
          className={`mood-chip${!activeMood ? " active" : ""}`}
          onClick={() => onMoodChange(null)}
        >
          tümü
        </button>
        {MOODS.map((m) => (
          <button
            key={m.id}
            className={`mood-chip${activeMood === m.id ? " active" : ""}`}
            onClick={() => onMoodChange(activeMood === m.id ? null : m.id)}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
