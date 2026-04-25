import { useTypewriter } from "../hooks/useTypewriter";

export default function Navbar({ onCompose, onRandom, onStats }) {
  const typed = useTypewriter("diyebilseydim", 90);

  return (
    <nav className="navbar">
      <div className="nav-actions-left">
        <button
          className="nav-icon-btn"
          onClick={onRandom}
          title="rastgele keşfet"
          aria-label="Rastgele mesaj"
        >
          🎲
        </button>
        <button
          className="nav-icon-btn"
          onClick={onStats}
          title="istatistikler"
          aria-label="İstatistikler"
        >
          📊
        </button>
      </div>

      <div className="nav-logo">
        <span className="nav-logo-text">
          {typed}
          <span className="cursor" />
        </span>
      </div>

      <button
        className="btn-compose"
        onClick={onCompose}
        id="btn-compose"
      >
        <span className="btn-compose-icon">✍️</span>
        yaz
      </button>
    </nav>
  );
}
