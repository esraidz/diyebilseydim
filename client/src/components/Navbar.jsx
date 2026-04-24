import { useTypewriter } from "../hooks/useTypewriter";

export default function Navbar({ onCompose }) {
  const typed = useTypewriter("diyebilseydim", 90);

  return (
    <nav className="navbar">
      <div className="nav-spacer" />

      <div className="nav-logo">
        <span className="nav-logo-text">{typed}</span>
        <span className="cursor" />
      </div>

      <button
        id="compose-trigger"
        className="btn-compose"
        onClick={onCompose}
      >
        <span className="btn-compose-icon">✉️</span>
        <span>yaz</span>
      </button>
    </nav>
  );
}
