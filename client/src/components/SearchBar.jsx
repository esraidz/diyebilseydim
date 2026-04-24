export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-wrap fade-up" style={{ animationDelay: "0.15s" }}>
      <div className="search-bar">
        <svg
          className="search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          id="search-input"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="isim veya kelime ara…"
          type="search"
          autoComplete="off"
        />

        {value && (
          <button
            className="search-clear"
            onClick={() => onChange("")}
            aria-label="Aramayı temizle"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
