import { useState, useRef } from "react";
import { CARD_COLORS } from "../constants";

/* ── canvas share image ── */
function downloadCard(msg) {
  const color = CARD_COLORS.find((c) => c.id === msg.card_color) || CARD_COLORS[0];
  const W = 1080,
    H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = color.ink;
  ctx.fillRect(0, 0, W, 120);

  ctx.fillStyle = color.bg;
  ctx.font = "bold 42px sans-serif";
  ctx.fillText("şşş 🤫", 48, 78);
  if (msg.to_name) {
    ctx.font = "500 38px sans-serif";
    ctx.fillText(`için: ${msg.to_name}`, 240, 78);
  }

  ctx.font = "48px serif";
  ctx.fillText("✉️", W - 100, 80);

  ctx.fillStyle = color.ink;
  ctx.font = "bold 72px sans-serif";
  const maxW = W - 96;
  const lineH = 90;
  const words = msg.content.split(" ");
  let line = "",
    y = 240;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), 48, y);
      line = words[i] + " ";
      y += lineH;
    } else line = test;
    if (y > H - 200) {
      ctx.fillText("...", 48, y);
      break;
    }
  }
  ctx.fillText(line.trim(), 48, y);

  ctx.fillStyle = color.ink + "66";
  ctx.font = "300 34px sans-serif";
  ctx.fillText("diyebilseydim.vercel.app", 48, H - 60);

  const a = document.createElement("a");
  a.download = "diyebilseydim.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export default function MessageCard({ msg, index }) {
  const [downloading, setDl] = useState(false);
  const cardRef = useRef(null);
  const color = CARD_COLORS.find((c) => c.id === msg.card_color) || CARD_COLORS[0];

  /* 3D tilt */
  function handleMouse(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotY = ((x - midX) / midX) * 6;
    const rotX = ((midY - y) / midY) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
  }
  function handleLeave() {
    const card = cardRef.current;
    if (card) card.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      className="msg-card"
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        "--card-bg": color.bg,
        "--card-ink": color.ink,
        "--card-delay": `${Math.min(index * 0.06, 0.6)}s`,
      }}
    >
      {/* header */}
      <div className="msg-card-header">
        <div className="msg-card-header-left">
          <span className="msg-card-shh">şşş 🤫</span>
          {msg.to_name && (
            <span className="msg-card-to">· {msg.to_name}</span>
          )}
        </div>
        <button
          className="msg-card-dl"
          onClick={() => {
            setDl(true);
            setTimeout(() => {
              downloadCard(msg);
              setDl(false);
            }, 80);
          }}
          title="paylaş / indir"
          aria-label="Kartı indir"
        >
          {downloading ? (
            <span className="spinner-sm" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </button>
      </div>

      {/* body */}
      <div className="msg-card-body">
        <p className="msg-card-text">{msg.content}</p>
        <p className="msg-card-date">
          {new Date(msg.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>
    </div>
  );
}
