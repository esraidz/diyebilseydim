import { useEffect, useState, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://msnidbqlvjruttajsuhk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbmlkYnFsdmpydXR0YWpzdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTEwNjUsImV4cCI6MjA5MDM2NzA2NX0.o33Meb-GxnxixWH7kOsbdGI3gWB6d6NBwyeRwK4Eo3Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GFONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');`;

// typewriter hook — yazar, bekler, siler, tekrar yazar
function useTypewriter(text, speed = 90) {
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    let timeout;
    if (!deleting && displayed.length < text.length) {
      timeout = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    } else if (!deleting && displayed.length === text.length) {
      timeout = setTimeout(() => setDeleting(true), 2800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(text.slice(0, displayed.length - 1)), speed / 2);
    } else if (deleting && displayed.length === 0) {
      timeout = setTimeout(() => setDeleting(false), 500);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, text]);
  return { displayed, typing: !deleting };
}

// floating 3d-ish emoji objects
const FLOATERS = [
  { emoji: "🤫", top: "8%",  left: "4%",  size: 52, rot: -15, delay: 0 },
  { emoji: "💌", top: "12%", right: "6%", size: 48, rot: 12,  delay: 0.4 },
  { emoji: "🌙", top: "38%", left: "2%",  size: 40, rot: -8,  delay: 0.8 },
  { emoji: "✨", top: "55%", right: "3%", size: 38, rot: 20,  delay: 0.2 },
  { emoji: "🥀", top: "72%", left: "3%",  size: 44, rot: -12, delay: 1.0 },
  { emoji: "💬", top: "80%", right: "5%", size: 46, rot: 8,   delay: 0.6 },
];

function SpeechBubble({ msg, index }) {
  const [hov, setHov] = useState(false);

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-start",
      animationDelay: `${index * 0.06}s`,
      animation: "cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          maxWidth: "78%",
          background: "#fff",
          borderRadius: "24px 24px 24px 4px",
          padding: "16px 20px",
          boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.18)" : "0 4px 20px rgba(0,0,0,0.12)",
          transform: hov ? "scale(1.02)" : "scale(1)",
          transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          cursor: "default",
        }}
      >
        {msg.to_name && (
          <p style={{
            fontSize: 11, fontWeight: 700,
            background: "linear-gradient(135deg,#ec4899,#a855f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            {msg.to_name}
          </p>
        )}
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 15, fontWeight: 700,
          color: "#1a1a1a", lineHeight: 1.6,
          wordBreak: "break-word",
        }}>
          {msg.content}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <p style={{ fontSize: 10, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>
            {new Date(msg.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
          </p>
          <span style={{ fontSize: 12, opacity: hov ? 1 : 0, transition: "opacity 0.2s" }}>🤫</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [compose, setCompose]         = useState(false);
  const [closing, setClosing]         = useState(false);
  const [to, setTo]                   = useState("");
  const [text, setText]               = useState("");
  const [sending, setSending]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const sheetRef                      = useRef(null);
  const typed = useTypewriter("diyebilseydim", 90);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GFONTS + `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: linear-gradient(160deg, #f472b6 0%, #a855f7 55%, #7c3aed 100%);
        min-height: 100vh;
        -webkit-font-smoothing: antialiased;
      }
      textarea, input { font-family: inherit; }
      textarea { resize: none; }
      textarea::placeholder { color: rgba(0,0,0,0.25); }
      input::placeholder   { color: rgba(0,0,0,0.25); }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 2px; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(14px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
      }
      @keyframes float {
        0%,100% { transform: translateY(0px) rotate(var(--rot)); }
        50%      { transform: translateY(-10px) rotate(var(--rot)); }
      }
      @keyframes slideUp {
        from { transform: translateY(110%); }
        to   { transform: translateY(0); }
      }
      @keyframes slideDown {
        from { transform: translateY(0); }
        to   { transform: translateY(110%); }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes gradShift {
        0%,100% { background-position: 0% 50%; }
        50%      { background-position: 100% 50%; }
      }
      @keyframes pop {
        0%  { transform: scale(0.8); opacity: 0; }
        65% { transform: scale(1.05); opacity: 1; }
        100%{ transform: scale(1); opacity: 1; }
      }
      @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
      @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }

      .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
      .cursor { display:inline-block; width:3px; height:1em; background:#fff; margin-left:3px; vertical-align:middle; border-radius:1px; animation: blink 0.75s ease-in-out infinite; }
      .spinner {
        display:inline-block; width:16px; height:16px;
        border:2px solid rgba(255,255,255,0.3);
        border-top-color:white; border-radius:50%;
        animation:spin 0.7s linear infinite;
      }
      .compose-sheet {
        position:fixed; bottom:0; left:0; right:0; z-index:100;
        animation: slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
        border-radius: 28px 28px 0 0;
        max-height: 88vh; overflow-y: auto;
        background: #fff;
        box-shadow: 0 -20px 80px rgba(0,0,0,0.25);
      }
      .compose-sheet.closing {
        animation: slideDown 0.3s cubic-bezier(0.4,0,1,1) both;
      }
      .overlay {
        position:fixed; inset:0; z-index:99;
        background: rgba(0,0,0,0.35);
        backdrop-filter: blur(4px);
        animation: overlayIn 0.2s ease both;
      }
      .yaz-btn {
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .yaz-btn:hover {
        transform: scale(1.04) translateY(-1px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages").select("*")
        .order("created_at", { ascending: false }).limit(80);
      if (data) setMessages(data);
      setLoading(false);
    })();
    const ch = supabase.channel("msgs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        p => setMessages(prev => [p.new, ...prev]))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      content: text.trim(),
      to_name: to.trim() || null,
      color: "#ec4899", color_name: "pembe",
    });
    if (!error) {
      setSubmitted(true);
      setText(""); setTo("");
      setTimeout(() => { setSubmitted(false); closeCompose(); }, 2400);
    }
    setSending(false);
  };

  const closeCompose = () => {
    setClosing(true);
    setTimeout(() => { setCompose(false); setClosing(false); setSubmitted(false); }, 280);
  };

  const filtered = messages.filter(m =>
    search.trim() === "" ? true :
    (m.to_name || "").toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#f472b6 0%,#a855f7 55%,#7c3aed 100%)",
      fontFamily: "'Nunito', sans-serif",
      position: "relative", overflowX: "hidden",
    }}>

      {/* floating emojis */}
      {FLOATERS.map((f, i) => (
        <div key={i} style={{
          position: "fixed",
          top: f.top, left: f.left, right: f.right,
          fontSize: f.size,
          "--rot": `${f.rot}deg`,
          animation: `float ${3.5 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${f.delay}s`,
          pointerEvents: "none", zIndex: 0,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
          userSelect: "none",
        }}>
          {f.emoji}
        </div>
      ))}

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 28px",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(244,114,182,0.15)",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ width: 80 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 26, fontWeight: 900, color: "#fff",
            letterSpacing: "-0.03em",
            textShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}>
            {typed.displayed}<span className="cursor" />
          </span>
        </div>
        <button
          className="yaz-btn"
          onClick={() => setCompose(true)}
          style={{
            background: "#fff", color: "#a855f7",
            border: "none", borderRadius: 30,
            padding: "10px 24px",
            fontFamily: "'Nunito', sans-serif",
            fontSize: 14, fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          ✉️ yaz
        </button>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <div className="fade-up" style={{ textAlign: "center", padding: "52px 24px 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 10, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>🤫</div>
          <h1 style={{
            fontSize: "clamp(32px,7vw,68px)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            textShadow: "0 4px 32px rgba(0,0,0,0.15)",
            marginBottom: 14,
          }}>
            söyleyemediklerini<br />burada bırak.
          </h1>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.5)",
            fontWeight: 400, fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.12em",
          }}>
            şşş · anonim · kimse bilmez
          </p>
        </div>

        {/* ── SEARCH ── */}
        <div className="fade-up" style={{ maxWidth: 420, margin: "0 auto 44px", padding: "0 24px", animationDelay: "0.1s" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 30, padding: "12px 20px",
            backdropFilter: "blur(10px)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="isim veya kelime ara…"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", fontSize: 13,
                color: "#fff", fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 18 }}>×</button>
            )}
          </div>
        </div>

        {/* ── BUBBLES ── */}
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 120px" }}>

          {messages.length > 0 && (
            <p style={{
              textAlign: "center", fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.1em", marginBottom: 28,
            }}>
              {search ? `${filtered.length} sonuç` : `${messages.length} söylenmemiş şey`}
            </p>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>
                {search ? `"${search}" bulunamadı.` : "henüz hiç şey bırakılmamış."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((msg, i) => (
                <SpeechBubble key={msg.id} msg={msg} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── OVERLAY ── */}
      {compose && <div className="overlay" onClick={closeCompose} />}

      {/* ── COMPOSE SHEET ── */}
      {compose && (
        <div className={`compose-sheet${closing ? " closing" : ""}`}>
          <div style={{ padding: "14px 0 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
          </div>

          <div style={{ padding: "20px 28px 44px" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "48px 0", animation: "pop 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🤫</div>
                <p style={{
                  fontSize: 24, fontWeight: 900, marginBottom: 6,
                  background: "linear-gradient(135deg,#ec4899,#a855f7)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  bırakıldı.
                </p>
                <p style={{ fontSize: 13, color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>
                  bazen yazmak yeterlidir.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>yeni mesaj ✉️</p>
                  <button onClick={closeCompose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: "#ccc", lineHeight: 1 }}>×</button>
                </div>

                {/* gradient line */}
                <div style={{ height: 2, background: "linear-gradient(135deg,#ec4899,#a855f7)", borderRadius: 1, marginBottom: 20 }} />

                <input
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  maxLength={60}
                  placeholder="kime? (opsiyonel)"
                  style={{
                    width: "100%", background: "#f9fafb",
                    border: "1px solid #f0f0f0", borderRadius: 14,
                    outline: "none", padding: "12px 16px",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 15, fontWeight: 700, color: "#1a1a1a",
                    marginBottom: 12,
                  }}
                />

                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                  maxLength={600}
                  rows={5}
                  placeholder="yazmak istediğin ama hiç yazamadığın şeyi…"
                  style={{
                    width: "100%", background: "#f9fafb",
                    border: "1px solid #f0f0f0", borderRadius: 14,
                    outline: "none", padding: "14px 16px",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 16, fontWeight: 700,
                    lineHeight: 1.7, color: "#1a1a1a",
                    display: "block", marginBottom: 16,
                  }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#ccc", fontFamily: "'DM Sans', sans-serif" }}>{text.length}/600</span>
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    style={{
                      background: text.trim() && !sending
                        ? "linear-gradient(135deg,#ec4899,#a855f7)"
                        : "#f0f0f0",
                      color: text.trim() && !sending ? "#fff" : "#ccc",
                      border: "none", borderRadius: 30,
                      padding: "12px 32px",
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 15, fontWeight: 800,
                      cursor: text.trim() && !sending ? "pointer" : "default",
                      transition: "all 0.25s",
                      display: "flex", alignItems: "center", gap: 8,
                      minWidth: 110, justifyContent: "center",
                      boxShadow: text.trim() && !sending ? "0 6px 24px rgba(168,85,247,0.35)" : "none",
                    }}
                  >
                    {sending ? <span className="spinner" /> : "gönder 🤫"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <footer style={{
        textAlign: "center", padding: "0 0 40px",
        fontSize: 11, color: "rgba(255,255,255,0.3)",
        letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif",
      }}>
        anonim · kimse bilmez · sadece sen
      </footer>
    </div>
  );
}