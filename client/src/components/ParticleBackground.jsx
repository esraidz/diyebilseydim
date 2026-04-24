import { useEffect, useRef } from "react";

/* ── tiny particle engine ── */
const SYMBOLS = ["✦", "♡", "✉", "·", "⁕", "✧"];
const COUNT = 45;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(w, h) {
  return {
    x: rand(0, w),
    y: rand(0, h),
    r: rand(1.2, 3.5),
    dx: rand(-0.15, 0.15),
    dy: rand(-0.25, -0.06),
    alpha: rand(0.15, 0.45),
    symbol: SYMBOLS[Math.floor(rand(0, SYMBOLS.length))],
    fontSize: rand(8, 18),
    pulse: rand(0, Math.PI * 2),
    pulseSpeed: rand(0.008, 0.025),
  };
}

export default function ParticleBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: COUNT }, () =>
        createParticle(canvas.width, canvas.height)
      );
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.pulse += p.pulseSpeed;
        const glow = 0.5 + 0.5 * Math.sin(p.pulse);
        const alpha = p.alpha * (0.6 + 0.4 * glow);

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = rand(0, canvas.width);
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${p.fontSize}px sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(255,255,255,0.6)";
        ctx.shadowBlur = 8 * glow;
        ctx.fillText(p.symbol, p.x, p.y);
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}
