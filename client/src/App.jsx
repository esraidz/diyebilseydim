import { useEffect, useState, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://msnidbqlvjruttajsuhk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbmlkYnFsdmpydXR0YWpzdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTEwNjUsImV4cCI6MjA5MDM2NzA2NX0.o33Meb-GxnxixWH7kOsbdGI3gWB6d6NBwyeRwK4Eo3Q";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COLORS = [
  { name: "Seni seviyordum", value: "#c084fc" },
  { name: "Sana kızgındım", value: "#f87171" },
  { name: "Seni özledim", value: "#60a5fa" },
  { name: "Teşekkür etmek istedim", value: "#34d399" },
  { name: "Üzgündüm", value: "#94a3b8" },
  { name: "Sadece yazmak istedim", value: "#fbbf24" },
];

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400&display=swap');`;

export default function App() {
  const [text, setText] = useState("");
  const [to, setTo] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [messages, setMessages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState("hepsi");
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONT + `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #080808; }
      ::selection { background: rgba(255,255,255,0.15); }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      textarea { resize: none; }
      textarea::placeholder { color: #444; }
      input::placeholder { color: #444; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.4); }
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes checkmark {
        0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
        60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .card-enter { animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
      .fade-up    { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
      .check-anim { animation: checkmark 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
      .spinner {
        width: 16px; height: 16px; border: 2px solid transparent;
        border-top-color: currentColor; border-radius: 50%;
        animation: spin 0.7s linear infinite; display: inline-block;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleSubmit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      content: text.trim(),
      to_name: to.trim() || null,
      color,
      color_name: COLORS.find((c) => c.value === color)?.name || "",
    });
    if (!error) {
      setText("");
      setTo("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const filtered = filter === "hepsi" ? messages : messages.filter((m) => m.color === filter);
  const uniqueColors = [...new Set(messages.map((m) => m.color))];

  return (
    <div style={styles.root}>
      <header style={styles.header} className="fade-up">
        <div style={styles.dot} />
        <h1 style={styles.title}>diyebilseydim</h1>
        <p style={styles.subtitle}>söyleyemediklerini burada bırak. isimsiz. özgür.</p>
      </header>

      <div style={styles.card} className="fade-up">
        {submitted ? (
          <div style={styles.successBox}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 10 }} className="check-anim">✓</span>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#fff" }}>bırakıldı.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#666", marginTop: 6 }}>
              bazen yazmak yeterlidir.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.toRow}>
              <span style={{ ...styles.toLabel, color: color }}>Kime:</span>
              <input
                style={styles.toInput}
                placeholder="bir isim, bir sıfat, ya da boş bırak…"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                maxLength={60}
              />
            </div>
            <div style={styles.divider} />
            <textarea
              ref={textareaRef}
              style={styles.textarea}
              placeholder="yazmak istediğin ama hiç yazamadığın şeyi yaz…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
              maxLength={600}
            />
            <div style={styles.bottomRow}>
              <div style={styles.colorRow}>
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    title={c.name}
                    style={{
                      ...styles.colorDot,
                      background: c.value,
                      transform: color === c.value ? "scale(1.35)" : "scale(1)",
                      boxShadow: color === c.value ? `0 0 0 2px #080808, 0 0 0 3px ${c.value}` : "none",
                    }}
                  />
                ))}
              </div>
              <div style={styles.rightRow}>
                <span style={styles.charCount}>{text.length}/600</span>
                <button
                  style={{
                    ...styles.sendBtn,
                    background: text.trim() && !sending ? color : "#1a1a1a",
                    color: text.trim() && !sending ? "#000" : "#444",
                    cursor: text.trim() && !sending ? "pointer" : "default",
                  }}
                  onClick={handleSubmit}
                >
                  {sending ? <span className="spinner" /> : "bırak"}
                </button>
              </div>
            </div>
            <p style={styles.hint}>⌘ + Enter ile de gönderebilirsin</p>
          </>
        )}
      </div>

      <div style={styles.feed}>
        {messages.length > 0 && (
          <p style={styles.totalCount}>
            <span style={{ color: "#fff" }}>{messages.length}</span> söylenmemiş şey bırakıldı
          </p>
        )}
        {messages.length > 0 && (
          <div style={styles.filterRow}>
            <button
              style={{ ...styles.filterBtn, borderColor: filter === "hepsi" ? "#555" : "transparent", color: filter === "hepsi" ? "#fff" : "#555" }}
              onClick={() => setFilter("hepsi")}
            >
              hepsi
            </button>
            {uniqueColors.map((c) => {
              const found = COLORS.find((x) => x.value === c);
              return (
                <button
                  key={c}
                  style={{ ...styles.filterBtn, borderColor: filter === c ? c : "transparent", color: filter === c ? c : "#555" }}
                  onClick={() => setFilter(filter === c ? "hepsi" : c)}
                  title={found?.name}
                >
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c, marginRight: 6 }} />
                  {found?.name.split(" ")[0].toLowerCase()}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <span className="spinner" style={{ borderTopColor: "#444", width: 24, height: 24, borderWidth: 3 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#333", fontSize: 16 }}>
              henüz hiçbir şey bırakılmamış.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#2a2a2a", fontSize: 12, marginTop: 8 }}>
              ilk olan sen ol.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((msg, i) => (
              <div
                key={msg.id}
                className="card-enter"
                style={{
                  ...styles.msgCard,
                  borderLeftColor: msg.color,
                  animationDelay: `${i * 0.04}s`,
                  background: hoveredId === msg.id ? "#141414" : "#0e0e0e",
                  transition: "background 0.2s",
                }}
                onMouseEnter={() => setHoveredId(msg.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {msg.to_name && (
                  <p style={{ ...styles.msgTo, color: msg.color }}>{msg.to_name}'e</p>
                )}
                <p style={styles.msgContent}>{msg.content}</p>
                <div style={styles.msgMeta}>
                  <span style={{ ...styles.msgTag, color: msg.color }}>{msg.color_name}</span>
                  <span style={styles.msgTime}>
                    {new Date(msg.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        <p>anonim · kimse bilmez · sadece sen</p>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 20px 80px",
  },
  header: { textAlign: "center", paddingTop: 64, paddingBottom: 40 },
  dot: {
    width: 8, height: 8, background: "#c084fc", borderRadius: "50%",
    margin: "0 auto 20px", animation: "pulse-dot 2.4s ease-in-out infinite",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(28px, 6vw, 44px)",
    fontWeight: 400, letterSpacing: "-0.5px", color: "#fff", marginBottom: 10,
  },
  subtitle: { fontSize: 14, color: "#555", letterSpacing: "0.02em", fontWeight: 300 },
  card: {
    width: "100%", maxWidth: 520, background: "#0e0e0e",
    border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px 24px 18px", marginBottom: 40,
  },
  successBox: { textAlign: "center", padding: "32px 0 24px" },
  toRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  toLabel: { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 15, flexShrink: 0, transition: "color 0.3s" },
  toInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300 },
  divider: { height: 1, background: "#1e1e1e", marginBottom: 14 },
  textarea: {
    width: "100%", background: "transparent", border: "none", outline: "none",
    color: "#ddd", fontFamily: "'Playfair Display', serif", fontStyle: "italic",
    fontSize: 15, lineHeight: 1.8, display: "block", marginBottom: 18,
  },
  bottomRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  colorRow: { display: "flex", gap: 8, alignItems: "center" },
  colorDot: { width: 16, height: 16, borderRadius: "50%", border: "none", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", flexShrink: 0 },
  rightRow: { display: "flex", alignItems: "center", gap: 12 },
  charCount: { fontSize: 11, color: "#444" },
  sendBtn: {
    padding: "8px 20px", borderRadius: 20, border: "none",
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400,
    letterSpacing: "0.04em", transition: "background 0.3s, color 0.3s",
    display: "flex", alignItems: "center", justifyContent: "center", minWidth: 60, minHeight: 34,
  },
  hint: { marginTop: 12, fontSize: 11, color: "#333", textAlign: "right" },
  feed: { width: "100%", maxWidth: 520 },
  totalCount: { textAlign: "center", fontSize: 13, color: "#444", marginBottom: 24 },
  filterRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  filterBtn: {
    background: "transparent", border: "1px solid", borderRadius: 20,
    padding: "5px 12px", fontSize: 12, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center",
  },
  grid: { display: "flex", flexDirection: "column", gap: 12 },
  msgCard: { background: "#0e0e0e", border: "1px solid #1a1a1a", borderLeft: "3px solid", borderRadius: 12, padding: "18px 18px 14px" },
  msgTo: { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, marginBottom: 8, opacity: 0.9 },
  msgContent: { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.75, color: "#ccc", marginBottom: 12 },
  msgMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  msgTag: { fontSize: 11, opacity: 0.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 },
  msgTime: { fontSize: 11, color: "#333", fontFamily: "'DM Sans', sans-serif" },
  footer: { marginTop: 60, fontSize: 12, color: "#2a2a2a", letterSpacing: "0.05em", textAlign: "center" },
};