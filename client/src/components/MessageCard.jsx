import { useState, useRef } from "react";
import { CARD_COLORS, MOODS } from "../constants";

/* ── canvas share image — story format 1080×1920 ── */
function downloadCard(msg) {
  const color =
    CARD_COLORS.find((c) => c.id === msg.card_color) || CARD_COLORS[0];
  const mood = msg.mood ? MOODS.find((m) => m.id === msg.mood) : null;
  const W = 1080,
    H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  /* gradient background */
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, color.bg);
  grad.addColorStop(1, color.ink + "22");
  ctx.fillStyle = color.bg;
  ctx.fillRect(0, 0, W, H);

  /* decorative circles */
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = color.ink;
  ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.15, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.2, H * 0.85, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  /* header bar */
  ctx.fillStyle = color.ink;
  ctx.fillRect(0, 0, W, 140);
  ctx.fillStyle = color.bg;
  ctx.font = "bold 48px sans-serif";
  ctx.fillText("şşş 🤫", 56, 92);
  if (msg.to_name) {
    ctx.font = "500 42px sans-serif";
    ctx.fillText(`· ${msg.to_name}`, 260, 92);
  }
  ctx.font = "48px serif";
  ctx.fillText("✉️", W - 110, 95);

  /* main text — centered vertically */
  ctx.fillStyle = color.ink;
  ctx.font = "bold 76px sans-serif";
  const maxW = W - 120;
  const lineH = 100;
  const words = msg.content.split(" ");
  const lines = [];
  let currentLine = "";
  for (let i = 0; i < words.length; i++) {
    const test = currentLine + words[i] + " ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      lines.push(currentLine.trim());
      currentLine = words[i] + " ";
    } else {
      currentLine = test;
    }
  }
  lines.push(currentLine.trim());

  const totalTextH = lines.length * lineH;
  let startY = (H - totalTextH) / 2 + 40;
  startY = Math.max(200, Math.min(startY, H - totalTextH - 300));

  for (let i = 0; i < lines.length && startY + i * lineH < H - 300; i++) {
    ctx.fillText(lines[i], 60, startY + i * lineH);
  }

  /* mood tag */
  if (mood) {
    ctx.fillStyle = color.ink + "44";
    ctx.font = "500 40px sans-serif";
    ctx.fillText(`${mood.emoji} ${mood.label}`, 60, H - 260);
  }

  /* branding footer */
  ctx.fillStyle = color.ink + "33";
  ctx.fillRect(0, H - 180, W, 1);

  ctx.fillStyle = color.ink + "66";
  ctx.font = "400 36px sans-serif";
  ctx.fillText("diyebilseydim.vercel.app", 60, H - 110);

  ctx.font = "300 30px sans-serif";
  ctx.fillStyle = color.ink + "44";
  ctx.fillText("sen de söyleyemediğini bırak →", 60, H - 60);

  /* download or share */
  canvas.toBlob(async (blob) => {
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], "diyebilseydim.png", {
          type: "image/png",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "diyebilseydim",
            text: "söyleyemediğini burada bırak 🤫",
          });
          return;
        }
      } catch {
        /* user cancelled or share failed — fall through to download */
      }
    }
    /* fallback: download */
    const a = document.createElement("a");
    a.download = "diyebilseydim.png";
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}

export default function MessageCard({ msg, index }) {
  const [downloading, setDl] = useState(false);
  const cardRef = useRef(null);
  const color =
    CARD_COLORS.find((c) => c.id === msg.card_color) || CARD_COLORS[0];
  const mood = msg.mood ? MOODS.find((m) => m.id === msg.mood) : null;

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
          title="story olarak paylaş / indir"
          aria-label="Kartı paylaş"
        >
          {downloading ? (
            <span className="spinner-sm" />
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          )}
        </button>
      </div>

      {/* body */}
      <div className="msg-card-body">
        <p className="msg-card-text">{msg.content}</p>
        <div className="msg-card-footer">
          {mood && (
            <span className="msg-card-mood">
              {mood.emoji} {mood.label}
            </span>
          )}
          <p className="msg-card-date">
            {new Date(msg.created_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
