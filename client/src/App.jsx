import { useEffect, useState, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://msnidbqlvjruttajsuhk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbmlkYnFsdmpydXR0YWpzdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTEwNjUsImV4cCI6MjA5MDM2NzA2NX0.o33Meb-GxnxixWH7kOsbdGI3gWB6d6NBwyeRwK4Eo3Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GFONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');`;

const CARD_COLORS = [
  { id: "white",  bg: "#ffffff", ink: "#0a0a0a", label: "beyaz" },
  { id: "black",  bg: "#0a0a0a", ink: "#ffffff", label: "siyah" },
  { id: "pink",   bg: "#fce4ec", ink: "#1a0a0f", label: "pembe" },
  { id: "purple", bg: "#ede7f6", ink: "#1a0a2e", label: "mor" },
  { id: "mint",   bg: "#e0f2f1", ink: "#0a1f1e", label: "mint" },
  { id: "peach",  bg: "#fff3e0", ink: "#1f0f00", label: "şeftali" },
  { id: "night",  bg: "#1a1a2e", ink: "#e8e8ff", label: "gece" },
  { id: "rose",   bg: "#ff6b9d", ink: "#ffffff", label: "gül" },
];

const FLOATERS = [
  { emoji: "🤫", top: "10%", left: "3%",  size: 44, delay: 0 },
  { emoji: "💌", top: "18%", right: "4%", size: 40, delay: 0.5 },
  { emoji: "🌙", top: "42%", left: "2%",  size: 34, delay: 0.9 },
  { emoji: "✨", top: "60%", right: "3%", size: 32, delay: 0.3 },
  { emoji: "🥀", top: "75%", left: "2%",  size: 38, delay: 1.1 },
];

// typewriter — yazar siler tekrar yazar
function useTypewriter(text, speed = 90) {
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting]   = useState(false);
  useEffect(() => {
    let t;
    if (!deleting && displayed.length < text.length)
      t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    else if (!deleting && displayed.length === text.length)
      t = setTimeout(() => setDeleting(true), 2800);
    else if (deleting && displayed.length > 0)
      t = setTimeout(() => setDisplayed(text.slice(0, displayed.length - 1)), speed / 2);
    else
      t = setTimeout(() => setDeleting(false), 500);
    return () => clearTimeout(t);
  }, [displayed, deleting, text]);
  return displayed;
}

// canvas ile paylaşma görseli oluştur
function downloadCard(msg) {
  const color = CARD_COLORS.find(c => c.id === msg.card_color) || CARD_COLORS[0];
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // arkaplan
  ctx.fillStyle = color.bg;
  ctx.fillRect(0, 0, W, H);

  // üst bar — siyah/beyaz header
  const headerBg = color.ink;
  ctx.fillStyle = headerBg;
  ctx.fillRect(0, 0, W, 120);

  // header içi — "şşş 🤫" + kime
  ctx.fillStyle = color.bg;
  ctx.font = "bold 42px sans-serif";
  ctx.fillText("şşş 🤫", 48, 78);
  if (msg.to_name) {
    ctx.font = "500 38px sans-serif";
    ctx.fillText(`için: ${msg.to_name}`, 240, 78);
  }

  // zarf ikonu sağ üst
  ctx.font = "48px serif";
  ctx.fillText("✉️", W - 100, 80);

  // mesaj metni — büyük bold
  ctx.fillStyle = color.ink;
  ctx.font = `bold 72px sans-serif`;
  const maxW = W - 96;
  const lineH = 90;
  const words = msg.content.split(" ");
  let line = "", y = 240;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), 48, y); line = words[i] + " "; y += lineH;
    } else line = test;
    if (y > H - 200) { ctx.fillText("...", 48, y); break; }
  }
  ctx.fillText(line.trim(), 48, y);

  // alt — site adı
  ctx.fillStyle = color.ink + "66";
  ctx.font = "300 34px sans-serif";
  ctx.fillText("diyebilseydim.vercel.app", 48, H - 60);

  const a = document.createElement("a");
  a.download = "diyebilseydim.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
}

function MessageCard({ msg, index }) {
  const [hov, setHov]         = useState(false);
  const [downloading, setDl]  = useState(false);
  const color = CARD_COLORS.find(c => c.id === msg.card_color) || CARD_COLORS[0];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: color.bg,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.35)" : "0 4px 24px rgba(0,0,0,0.2)",
        transform: hov ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        animation: "cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
        display: "flex", flexDirection: "column",
        minHeight: 280,
      }}
    >
      {/* header bar */}
      <div style={{
        background: color.ink,
        padding: "10px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: color.bg, fontFamily: "'Nunito', sans-serif" }}>
            şşş 🤫
          </span>
          {msg.to_name && (
            <span style={{ fontSize: 12, color: color.bg + "aa", fontFamily: "'DM Sans', sans-serif" }}>
              · {msg.to_name}
            </span>
          )}
        </div>
        <button
          onClick={() => { setDl(true); setTimeout(() => { downloadCard(msg); setDl(false); }, 80); }}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: color.bg, fontSize: 16, opacity: hov ? 1 : 0.5,
            transition: "opacity 0.2s", display: "flex", alignItems: "center",
          }}
          title="paylaş"
        >
          {downloading ? "..." : "↓"}
        </button>
      </div>

      {/* mesaj */}
      <div style={{ padding: "18px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "clamp(16px, 2.5vw, 22px)",
          fontWeight: 800,
          color: color.ink,
          lineHeight: 1.5,
          wordBreak: "break-word",
          flex: 1,
        }}>
          {msg.content}
        </p>
        <p style={{
          fontSize: 10, color: color.ink + "55",
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 12,
        }}>
          {new Date(msg.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
        </p>
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
  const [cardColor, setCardColor]     = useState(CARD_COLORS[0]);
  const [sending, setSending]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const sheetRef                      = useRef(null);
  const typed                         = useTypewriter("diyebilseydim", 90);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GFONTS + `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: linear-gradient(160deg,#f472b6 0%,#a855f7 55%,#7c3aed 100%); min-height:100vh; -webkit-font-smoothing:antialiased; }
      textarea, input { font-family: inherit; }
      textarea { resize: none; }
      textarea::placeholder { color: rgba(0,0,0,0.25); }
      input::placeholder   { color: rgba(0,0,0,0.25); }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 2px; }

      @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes cardIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
      @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      @keyframes slideUp { from { transform:translateY(110%); } to { transform:translateY(0); } }
      @keyframes slideDown { from { transform:translateY(0); } to { transform:translateY(110%); } }
      @keyframes spin { to { transform:rotate(360deg); } }
      @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
      @keyframes pop { 0% { transform:scale(0.8); opacity:0; } 65% { transform:scale(1.05); opacity:1; } 100% { transform:scale(1); opacity:1; } }
      @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }

      .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
      .cursor { display:inline-block; width:3px; height:0.9em; background:#fff; margin-left:3px; vertical-align:middle; border-radius:1px; animation:blink 0.75s ease-in-out infinite; }
      .spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
      .compose-sheet { position:fixed; bottom:0; left:0; right:0; z-index:100; animation:slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both; border-radius:28px 28px 0 0; max-height:90vh; overflow-y:auto; background:#fff; box-shadow:0 -20px 80px rgba(0,0,0,0.25); }
      .compose-sheet.closing { animation:slideDown 0.3s cubic-bezier(0.4,0,1,1) both; }
      .overlay { position:fixed; inset:0; z-index:99; background:rgba(0,0,0,0.4); backdrop-filter:blur(6px); animation:overlayIn 0.2s ease both; }
      .yaz-btn { transition:transform 0.15s, box-shadow 0.15s; }
      .yaz-btn:hover { transform:scale(1.04) translateY(-1px); box-shadow:0 8px 32px rgba(0,0,0,0.2); }
      .color-opt { transition:transform 0.15s, box-shadow 0.15s; cursor:pointer; border:none; }
      .color-opt:hover { transform:scale(1.15); }
      @media (max-width:540px) { .card-grid { grid-template-columns: 1fr !important; } }
      @media (min-width:541px) and (max-width:860px) { .card-grid { grid-template-columns: repeat(2,1fr) !important; } }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages").select("*")
        .order("created_at", { ascending: false }).limit(100);
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
      card_color: cardColor.id,
      color:      cardColor.bg,
      color_name: cardColor.label,
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f472b6 0%,#a855f7 55%,#7c3aed 100%)", fontFamily: "'Nunito', sans-serif", position: "relative", overflowX: "hidden" }}>

      {/* floating emojis */}
      {FLOATERS.map((f, i) => (
        <div key={i} style={{
          position: "fixed", top: f.top, left: f.left, right: f.right,
          fontSize: f.size, pointerEvents: "none", zIndex: 0, userSelect: "none",
          animation: `float ${3.5 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${f.delay}s`,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
        }}>
          {f.emoji}
        </div>
      ))}

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 28px", position: "sticky", top: 0, zIndex: 50,
        background: "rgba(244,114,182,0.15)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ width: 90 }} />
        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          {typed}<span className="cursor" />
        </span>
        <button className="yaz-btn" onClick={() => setCompose(true)} style={{
          background: "#fff", color: "#a855f7", border: "none", borderRadius: 30,
          padding: "10px 22px", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800,
          cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
          ✉️ yaz
        </button>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <div className="fade-up" style={{ textAlign: "center", padding: "52px 24px 36px" }}>
          <p style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6, textShadow: "0 4px 32px rgba(0,0,0,0.15)" }}>
            şşş 🤫
          </p>
          <h1 style={{ fontSize: "clamp(30px,6vw,60px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.04em", textShadow: "0 4px 32px rgba(0,0,0,0.15)", marginBottom: 12 }}>
            söyleyemediklerini<br />burada bırak.
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.12em" }}>
            anonim · kimse bilmez
          </p>
        </div>

        {/* ── SEARCH ── */}
        <div className="fade-up" style={{ maxWidth: 420, margin: "0 auto 40px", padding: "0 24px", animationDelay: "0.1s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 30, padding: "11px 20px", backdropFilter: "blur(10px)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="isim veya kelime ara…"
              style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:13, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", fontSize:18 }}>×</button>}
          </div>
        </div>

        {/* ── CARDS ── */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px 120px" }}>
          {messages.length > 0 && (
            <p style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:24 }}>
              {search ? `${filtered.length} sonuç` : `${messages.length} söylenmemiş şey`}
            </p>
          )}

          {loading ? (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <span className="spinner" style={{ width:24, height:24, borderWidth:3 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:18, fontStyle:"italic", fontFamily:"'DM Sans',sans-serif" }}>
                {search ? `"${search}" bulunamadı.` : "henüz hiç şey bırakılmamış."}
              </p>
            </div>
          ) : (
            <div className="card-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {filtered.map((msg, i) => <MessageCard key={msg.id} msg={msg} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── OVERLAY ── */}
      {compose && <div className="overlay" onClick={closeCompose} />}

      {/* ── COMPOSE ── */}
      {compose && (
        <div className={`compose-sheet${closing ? " closing" : ""}`}>
          <div style={{ padding:"14px 0 0", display:"flex", justifyContent:"center" }}>
            <div style={{ width:40, height:4, borderRadius:2, background:"#e5e7eb" }} />
          </div>
          <div style={{ padding:"20px 28px 44px" }}>
            {submitted ? (
              <div style={{ textAlign:"center", padding:"48px 0", animation:"pop 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div style={{ fontSize:52, marginBottom:14 }}>🤫</div>
                <p style={{ fontSize:24, fontWeight:900, marginBottom:6, background:"linear-gradient(135deg,#ec4899,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>bırakıldı.</p>
                <p style={{ fontSize:13, color:"#aaa", fontFamily:"'DM Sans',sans-serif" }}>bazen yazmak yeterlidir.</p>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <p style={{ fontSize:16, fontWeight:800, color:"#1a1a1a" }}>yeni mesaj ✉️</p>
                  <button onClick={closeCompose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:"#ccc" }}>×</button>
                </div>

                <div style={{ height:2, background:"linear-gradient(135deg,#ec4899,#a855f7)", borderRadius:1, marginBottom:18 }} />

                {/* renk seç */}
                <div style={{ marginBottom:18 }}>
                  <p style={{ fontSize:11, color:"#aaa", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>kart rengi</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {CARD_COLORS.map(c => (
                      <button
                        key={c.id}
                        className="color-opt"
                        onClick={() => setCardColor(c)}
                        title={c.label}
                        style={{
                          width:28, height:28, borderRadius:"50%",
                          background: c.bg,
                          border: cardColor.id === c.id ? `3px solid #a855f7` : `2px solid #e5e7eb`,
                          transform: cardColor.id === c.id ? "scale(1.2)" : "scale(1)",
                          boxShadow: cardColor.id === c.id ? "0 0 0 2px #fff, 0 0 0 4px #a855f7" : "0 1px 4px rgba(0,0,0,0.12)",
                          transition: "all 0.15s",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* önizleme */}
                <div style={{
                  background: cardColor.bg, borderRadius:12, overflow:"hidden",
                  marginBottom:16, boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
                }}>
                  <div style={{ background:cardColor.ink, padding:"8px 12px", display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:12, fontWeight:900, color:cardColor.bg }}>şşş 🤫{to ? ` · ${to}` : ""}</span>
                    <span style={{ color:cardColor.bg, opacity:0.6 }}>✉️</span>
                  </div>
                  <div style={{ padding:"12px 14px" }}>
                    <input
                      value={to} onChange={e => setTo(e.target.value)} maxLength={60}
                      placeholder="kime? (opsiyonel)"
                      style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:13, color:cardColor.ink + "88", fontFamily:"'DM Sans',sans-serif", fontStyle:"italic", marginBottom:8 }}
                    />
                    <textarea
                      autoFocus value={text} onChange={e => setText(e.target.value)}
                      onKeyDown={e => { if (e.key==="Enter" && (e.metaKey||e.ctrlKey)) handleSend(); }}
                      maxLength={600} rows={4}
                      placeholder="yazmak istediğin ama hiç yazamadığın şeyi…"
                      style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:800, lineHeight:1.6, color:cardColor.ink, display:"block" }}
                    />
                  </div>
                </div>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#ccc", fontFamily:"'DM Sans',sans-serif" }}>{text.length}/600</span>
                  <button
                    onClick={handleSend} disabled={!text.trim()||sending}
                    style={{
                      background: text.trim()&&!sending ? "linear-gradient(135deg,#ec4899,#a855f7)" : "#f0f0f0",
                      color: text.trim()&&!sending ? "#fff" : "#ccc",
                      border:"none", borderRadius:30, padding:"12px 32px",
                      fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:800,
                      cursor: text.trim()&&!sending ? "pointer" : "default",
                      transition:"all 0.25s", display:"flex", alignItems:"center", gap:8,
                      minWidth:110, justifyContent:"center",
                      boxShadow: text.trim()&&!sending ? "0 6px 24px rgba(168,85,247,0.35)" : "none",
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

      <footer style={{ textAlign:"center", padding:"0 0 40px", fontSize:11, color:"rgba(255,255,255,0.2)", letterSpacing:"0.1em", fontFamily:"'DM Sans',sans-serif" }}>
        anonim · kimse bilmez · sadece sen
      </footer>
    </div>
  );
}