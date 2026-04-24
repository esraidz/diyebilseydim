export default function Hero({ messageCount }) {
  return (
    <header className="hero">
      <p className="hero-shh fade-up">şşş 🤫</p>

      <h1 className="hero-title fade-up" style={{ animationDelay: "0.1s" }}>
        söyleyemediklerini
        <br />
        <span className="hero-title-accent">burada bırak.</span>
      </h1>

      {messageCount > 0 && (
        <div
          className="hero-counter fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="hero-counter-dot" />
          <span>{messageCount} söylenmemiş şey</span>
        </div>
      )}
    </header>
  );
}
