import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CARD_COLORS } from "../constants";
import MoodSelector from "./MoodSelector";

/* ── emoji rain after send ── */
function EmojiRain() {
  const emojis = ["🤫", "💌", "✨", "🌙", "💜", "🥀", "♡", "✉️"];
  const drops = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      emoji: emojis[i % emojis.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.2 + Math.random() * 1,
      size: 16 + Math.random() * 20,
    }))
  );

  return (
    <div className="emoji-rain" aria-hidden="true">
      {drops.current.map((d, i) => (
        <span
          key={i}
          className="emoji-drop"
          style={{
            left: `${d.left}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            fontSize: d.size,
          }}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}

export default function ComposeSheet({ open, onClose }) {
  const [closing, setClosing] = useState(false);
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [cardColor, setCardColor] = useState(CARD_COLORS[0]);
  const [mood, setMood] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (open && textRef.current) {
      setTimeout(() => textRef.current?.focus(), 350);
    }
  }, [open]);

  const closeSheet = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
      setSubmitted(false);
    }, 280);
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const payload = {
      content: text.trim(),
      to_name: to.trim() || null,
      card_color: cardColor.id,
      color: cardColor.bg,
      color_name: cardColor.label,
      // TODO: mood sütununu Supabase'e ekledikten sonra aşağıdaki satırı aç
      // mood: mood || null,
    };
    const { error } = await supabase.from("messages").insert(payload);
    if (!error) {
      setSubmitted(true);
      setText("");
      setTo("");
      setMood(null);
      setTimeout(() => {
        setSubmitted(false);
        closeSheet();
      }, 2800);
    }
    setSending(false);
  };

  if (!open) return null;

  /* character count ratio for gradient color */
  const ratio = text.length / 600;
  const countColor =
    ratio < 0.6
      ? "var(--clr-count-ok)"
      : ratio < 0.85
      ? "var(--clr-count-warn)"
      : "var(--clr-count-danger)";

  return (
    <>
      <div className="overlay" onClick={closeSheet} />

      <div className={`compose-sheet${closing ? " closing" : ""}`}>
        {/* drag handle */}
        <div className="sheet-handle-wrap">
          <div className="sheet-handle" />
        </div>

        <div className="sheet-content">
          {submitted ? (
            <div className="sheet-success">
              <EmojiRain />
              <div className="sheet-success-inner pop">
                <div className="sheet-success-emoji">🤫</div>
                <p className="sheet-success-title">bırakıldı.</p>
                <p className="sheet-success-sub">
                  bazen yazmak yeterlidir.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* header */}
              <div className="sheet-header">
                <p className="sheet-header-title">yeni mesaj ✉️</p>
                <button
                  className="sheet-close"
                  onClick={closeSheet}
                  aria-label="Kapat"
                >
                  ×
                </button>
              </div>

              <div className="sheet-divider" />

              {/* color picker */}
              <div className="color-picker">
                <p className="color-picker-label">kart rengi</p>
                <div className="color-picker-grid">
                  {CARD_COLORS.map((c) => (
                    <button
                      key={c.id}
                      className={`color-dot${
                        cardColor.id === c.id ? " active" : ""
                      }`}
                      onClick={() => setCardColor(c)}
                      title={c.label}
                      aria-label={`Renk: ${c.label}`}
                      style={{
                        "--dot-bg": c.bg,
                        "--dot-ink": c.ink,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* mood selector */}
              <MoodSelector value={mood} onChange={setMood} />

              {/* live preview */}
              <div
                className="card-preview"
                style={{
                  "--card-bg": cardColor.bg,
                  "--card-ink": cardColor.ink,
                }}
              >
                <div className="card-preview-header">
                  <span className="card-preview-shh">
                    şşş 🤫{to ? ` · ${to}` : ""}
                  </span>
                  <span className="card-preview-icon">✉️</span>
                </div>
                <div className="card-preview-body">
                  <input
                    id="compose-to"
                    className="card-preview-to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    maxLength={60}
                    placeholder="kime? (opsiyonel)"
                    autoComplete="off"
                  />
                  <textarea
                    ref={textRef}
                    id="compose-text"
                    className="card-preview-textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                        handleSend();
                    }}
                    maxLength={600}
                    rows={4}
                    placeholder="yazmak istediğin ama hiç yazamadığın şeyi…"
                  />
                </div>
              </div>

              {/* footer actions */}
              <div className="sheet-actions">
                <span className="char-count" style={{ color: countColor }}>
                  {text.length}/600
                </span>
                <button
                  id="send-btn"
                  className={`btn-send${
                    text.trim() && !sending ? " active" : ""
                  }`}
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                >
                  {sending ? (
                    <span className="spinner-sm" />
                  ) : (
                    "gönder 🤫"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
