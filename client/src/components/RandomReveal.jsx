import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { CARD_COLORS, MOODS } from "../constants";

export default function RandomReveal({ open, onClose }) {
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    setAnimating(true);

    /* Supabase doesn't have a built-in random, so we use a workaround */
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      const offset = Math.floor(Math.random() * count);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .range(offset, offset)
        .limit(1);
      if (data && data.length > 0) {
        setMsg(data[0]);
      }
    }
    setLoading(false);
    /* remove animating class after card enters */
    setTimeout(() => setAnimating(false), 50);
  }, []);

  useEffect(() => {
    if (open) fetchRandom();
  }, [open, fetchRandom]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
      setMsg(null);
    }, 280);
  };

  if (!open) return null;

  const color =
    msg && CARD_COLORS.find((c) => c.id === msg.card_color)
      ? CARD_COLORS.find((c) => c.id === msg.card_color)
      : CARD_COLORS[0];

  const mood = msg?.mood
    ? MOODS.find((m) => m.id === msg.mood)
    : null;

  return (
    <>
      <div className="overlay random-overlay" onClick={handleClose} />

      <div className={`random-modal${closing ? " closing" : ""}`}>
        <button
          className="random-close"
          onClick={handleClose}
          aria-label="Kapat"
        >
          ✕
        </button>

        <div className="random-content">
          {loading ? (
            <div className="random-loading">
              <span className="spinner" />
            </div>
          ) : msg ? (
            <div
              className={`random-card${animating ? " animating" : ""}`}
              style={{ "--card-bg": color.bg, "--card-ink": color.ink }}
            >
              <div className="random-card-header">
                <span className="random-card-shh">şşş 🤫</span>
                {msg.to_name && (
                  <span className="random-card-to">· {msg.to_name}</span>
                )}
              </div>
              <div className="random-card-body">
                <p className="random-card-text">{msg.content}</p>
              </div>
              <div className="random-card-footer">
                {mood && (
                  <span className="random-card-mood">
                    {mood.emoji} {mood.label}
                  </span>
                )}
                <span className="random-card-date">
                  {new Date(msg.created_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ) : (
            <p className="random-empty">henüz mesaj yok 💭</p>
          )}
        </div>

        <button
          className="random-next"
          onClick={fetchRandom}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-sm" />
          ) : (
            "→ bir tane daha"
          )}
        </button>
      </div>
    </>
  );
}
