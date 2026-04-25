import { MOODS } from "../constants";

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="mood-selector">
      <p className="mood-selector-label">nasıl hissediyorsun? (opsiyonel)</p>
      <div className="mood-selector-grid">
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`mood-btn${value === m.id ? " active" : ""}`}
            onClick={() => onChange(value === m.id ? null : m.id)}
            title={m.label}
          >
            <span className="mood-btn-emoji">{m.emoji}</span>
            <span className="mood-btn-label">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
