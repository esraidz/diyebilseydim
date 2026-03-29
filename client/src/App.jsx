import { useEffect, useState, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://msnidbqlvjruttajsuhk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbmlkYnFsdmpydXR0YWpzdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTEwNjUsImV4cCI6MjA5MDM2NzA2NX0.o33Meb-GxnxixWH7kOsbdGI3gWB6d6NBwyeRwK4Eo3Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PAPERS = [
  { id: "cream", bg: "#fdf8f0", ink: "#2a2018", accent: "#c9a96e" },
  { id: "rose",  bg: "#fdf0f2", ink: "#3a1820", accent: "#d4848e" },
  { id: "night", bg: "#1a2035", ink: "#dde6f4", accent: "#7b9fd4" },
  { id: "sage",  bg: "#f0f7f1", ink: "#1a2e1c", accent: "#6a9e6e" },
  { id: "slate", bg: "#f2f4f8", ink: "#1e2430", accent: "#7a8fbb" },
];

const GFONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');`;

function downloadCard(msg) {
  const p = PAPERS.find(x => x.id === msg.paper) || PAPERS[0];
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.02})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
  ctx.fillStyle = p.accent;
  ctx.fillRect(80, 80, W - 160, 3);
  ctx.fillRect(80, H - 83, W - 160, 3);
  if (msg.to_name) {
    ctx.fillStyle = p.ink + "88";
    ctx.font = "italic 40px Georgia,serif";
    ctx.fillText(msg.to_name + "'e,", 80, 160);
  }
  ctx.fillStyle = p.ink;
  ctx.font = "italic 56px Georgia,serif";
  const words = msg.content.split(" ");
  let line = "", y = msg.to_name ? 270 : 210;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > W - 160 && i > 0) {
      ctx.fillText(line.trim(), 80, y); line = words[i] + " "; y += 76;
    } else line = test;
    if (y > H - 200) { ctx.fillText("...", 80, y); break; }
  }
  ctx.fillText(line.trim(), 80, y);
  ctx.fillStyle = p.ink + "44";
  ctx.font = "300 30px sans-serif";
  ctx.fillText("diyebilseydim.vercel.app", 80, H - 96);
  const a = document.createElement("a");
  a.download = "diyebilseydim.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export default function App() {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [compose, setCompose]       = useState(false);
  const [to, setTo]                 = useState("");
  const [text, setText]             = useState("");
  const [paper, setPaper]           = useState(PAPERS[0]);
  const [sending, setSending]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [hovered, setHovered]       = useState(null);
  const composeRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GFONTS + `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #f7f3ec; -webkit-font-smoothing: antialiased; }
      textarea, input { font-family: inherit; }
      textarea { resize: none; }
      textarea::placeholder, input::placeholder { opacity: 0.35; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

      @keyframes shimmer {
        0%   { text-shadow: 0 0 0px transparent; }
        50%  { text-shadow: 0 0 24px rgba(180,140,80,0.35); }
        100% { text-shadow: 0 0 0px transparent; }
      }
      @keyframes floatY {
        0%,100% { transform: translateY(0); }
        50%      { transform: translateY(-5px); }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(22px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }
      @keyframes slideDown {
        from { transform: translateY(0); }
        to   { transform: translateY(100%); }
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes sentPop {
        0%  { transform: scale(0.85); opacity: 0; }
        65% { transform: scale(1.04); opacity: 1; }
        100%{ transform: scale(1);    opacity: 1; }
      }

      .title-anim {
        animation: shimmer 4s ease-in-out infinite, floatY 6s ease-in-out infinite;
        display: inline-block;
      }
      .fade-up  { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) both; }
      .card-in  { animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      .spinner  {
        display:inline-block; width:15px; height:15px;
        border:2px solid transparent; border-top-color:currentColor;
        border-radius:50%; animation:spin 0.7s linear infinite;
      }
      .compose-sheet {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
        animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -12px 60px rgba(0,0,0,0.18);
        max-height: 92vh;
        overflow-y: auto;
      }
      .compose-sheet.closing {
        animation: slideDown 0.3s cubic-bezier(0.4,0,1,1) both;
      }
      .yaz-btn {
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .yaz-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(0,0,0,0.15);
      }
      .msg-card {
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .msg-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 32px rgba(0,0,0,0.14) !important;
      }
      .overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.3);
        z-index: 99; animation: fadeUp 0.2s ease both;
        backdrop-filter: blur(2px);
      }
      @media (max-width: 600px) {
        .grid-layout { grid-template-columns: 1fr !important; }
      }
      @media (min-width: 601px) and (max-width: 900px) {
        .grid-layout { grid-template-columns: 1fr 1fr !important; }
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
        .order("created_at", { ascending: false }).limit(120);
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
      content:    text.trim(),
      to_name:    to.trim() || null,
      paper:      paper.id,
      color:      paper.accent,
      color_name: paper.id,
    });
    if (!error) {
      setSubmitted(true);
      setText(""); setTo("");
      setTimeout(() => { setSubmitted(false); setCompose(false); }, 2400);
    }
    setSending(false);
  };

  const closeCompose = () => {
    if (composeRef.current) {
      composeRef.current.classList.add("closing");
      setTimeout(() => { setCompose(false); setSubmitted(false); }, 280);
    } else setCompose(false);
  };

  const filtered = messages.filter(m =>
    search.trim() === "" ? true :
    (m.to_name || "").toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7f3ec", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" }}>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 32px", borderBottom: "1px solid #e8e0d0",
        background: "#f7f3ec", position: "sticky", top: 0, zIndex: 50,
      }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 22, fontWeight: 400, color: "#2a2018" }}>
          <span className="title-anim">diyebilseydim</span>
        </h1>
        <button
          className="yaz-btn"
          onClick={() => setCompose(true)}
          style={{
            background: "#2a2018", color: "#f7f3ec",
            border: "none", borderRadius: 24, padding: "9px 22px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
            cursor: "pointer", letterSpacing: "0.02em",
          }}
        >
          ✉ yaz
        </button>
      </nav>

      {/* ── HERO ── */}
      <div className="fade-up" style={{ textAlign: "center", padding: "56px 24px 40px" }}>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(18px,4vw,26px)", color: "#888", fontWeight: 400, marginBottom: 8 }}>
          söyleyemediklerini burada bırak.
        </p>
        <p style={{ fontSize: 12, color: "#bbb", letterSpacing: "0.12em" }}>
          anonim · kayıt yok · kimse bilmez
        </p>
      </div>

      {/* ── SEARCH ── */}
      <div className="fade-up" style={{ maxWidth: 420, margin: "0 auto 40px", padding: "0 24px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#fff", borderRadius: 30, padding: "10px 18px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e8e0d0",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="isim veya kelime ara…"
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: "#2a2018", fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 16, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 100px" }}>

        {messages.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
            <span style={{ fontSize: 11, color: "#bbb", letterSpacing: "0.1em" }}>
              {search ? `${filtered.length} sonuç` : `${messages.length} mektup`}
            </span>
            <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <span className="spinner" style={{ borderTopColor: "#c9a96e", width: 24, height: 24, borderWidth: 3 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: "#ccc", fontSize: 18 }}>
              {search ? `"${search}" için sonuç yok.` : "henüz hiç mektup yok."}
            </p>
          </div>
        ) : (
          <div
            className="grid-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {filtered.map((msg, i) => {
              const p = PAPERS.find(x => x.id === msg.paper) || PAPERS[0];
              return (
                <div
                  key={msg.id}
                  className="card-in msg-card"
                  onMouseEnter={() => setHovered(msg.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: p.bg,
                    borderRadius: 14,
                    padding: "22px 20px 16px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    border: `1px solid ${p.accent}33`,
                    animationDelay: `${Math.min(i * 0.035, 0.5)}s`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* accent top bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.accent, borderRadius: "14px 14px 0 0" }} />

                  {msg.to_name && (
                    <p style={{
                      fontFamily: "'Lora', serif", fontStyle: "italic",
                      fontSize: 12, color: p.ink + "88", marginBottom: 8,
                    }}>
                      {msg.to_name}'e,
                    </p>
                  )}

                  <p style={{
                    fontFamily: "'Lora', serif", fontStyle: "italic",
                    fontSize: 15, lineHeight: 1.8, color: p.ink,
                    marginBottom: 16, wordBreak: "break-word",
                  }}>
                    {msg.content}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: p.ink + "55", fontFamily: "'DM Sans', sans-serif" }}>
                      {new Date(msg.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                    </span>
                    <button
                      onClick={() => { setDownloading(msg.id); setTimeout(() => { downloadCard(msg); setDownloading(null); }, 80); }}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: hovered === msg.id ? p.accent : p.ink + "44",
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                        transition: "color 0.2s", padding: "2px 0",
                      }}
                    >
                      {downloading === msg.id ? (
                        <span className="spinner" style={{ borderTopColor: p.accent, width: 11, height: 11 }} />
                      ) : (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          paylaş
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── OVERLAY ── */}
      {compose && <div className="overlay" onClick={closeCompose} />}

      {/* ── COMPOSE SHEET ── */}
      {compose && (
        <div
          ref={composeRef}
          className="compose-sheet"
          style={{ background: paper.bg }}
        >
          <div style={{ padding: "20px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ width: 40, height: 4, background: paper.ink + "22", borderRadius: 2, margin: "0 auto" }} />
          </div>

          <div style={{ padding: "16px 28px 40px" }}>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "48px 0", animation: "sentPop 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>✉️</div>
                <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 22, color: paper.ink, marginBottom: 6 }}>bırakıldı.</p>
                <p style={{ fontSize: 13, color: paper.ink + "88" }}>bazen yazmak yeterlidir.</p>
              </div>
            ) : (
              <>
                {/* üst bar — kağıt seç + kapat */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {PAPERS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPaper(p)}
                        style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: p.bg, border: `2px solid ${paper.id === p.id ? p.accent : p.ink + "22"}`,
                          cursor: "pointer",
                          transform: paper.id === p.id ? "scale(1.2)" : "scale(1)",
                          transition: "transform 0.15s, border-color 0.15s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={closeCompose}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: paper.ink + "66", lineHeight: 1 }}
                  >×</button>
                </div>

                {/* accent line */}
                <div style={{ height: 2, background: paper.accent, borderRadius: 1, marginBottom: 20, opacity: 0.6 }} />

                {/* kime */}
                <input
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  maxLength={60}
                  placeholder="kime…"
                  style={{
                    width: "100%", background: "transparent", border: "none", outline: "none",
                    fontFamily: "'Lora', serif", fontStyle: "italic",
                    fontSize: 16, color: paper.ink + "aa",
                    borderBottom: `1px solid ${paper.ink}18`, paddingBottom: 12, marginBottom: 18,
                  }}
                />

                {/* mesaj */}
                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                  maxLength={600}
                  rows={6}
                  placeholder="yazmak istediğin ama hiç yazamadığın şeyi…"
                  style={{
                    width: "100%", background: "transparent", border: "none", outline: "none",
                    fontFamily: "'Lora', serif", fontStyle: "italic",
                    fontSize: 18, lineHeight: 1.85, color: paper.ink,
                    display: "block", marginBottom: 20,
                  }}
                />

                {/* alt */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: paper.ink + "44" }}>{text.length}/600</span>
                  <button
                    onClick={handleSend}
                    style={{
                      background: text.trim() && !sending ? paper.accent : paper.ink + "18",
                      color: text.trim() && !sending ? "#fff" : paper.ink + "44",
                      border: "none", borderRadius: 24, padding: "10px 28px",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                      cursor: text.trim() && !sending ? "pointer" : "default",
                      transition: "all 0.25s",
                      display: "flex", alignItems: "center", gap: 7, minWidth: 90, justifyContent: "center",
                    }}
                  >
                    {sending ? <span className="spinner" /> : "gönder"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <footer style={{ textAlign: "center", padding: "16px 0 32px", fontSize: 11, color: "#ccc", letterSpacing: "0.08em" }}>
        anonim · kimse bilmez · sadece sen
      </footer>
    </div>
  );
}