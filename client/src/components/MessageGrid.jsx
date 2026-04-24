import { useEffect, useRef } from "react";
import MessageCard from "./MessageCard";

export default function MessageGrid({ messages, search, loading }) {
  const gridRef = useRef(null);

  /* Intersection Observer — scroll reveal */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const cards = grid.querySelectorAll(".msg-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [messages, search]);

  if (loading) {
    return (
      <div className="grid-empty">
        <span className="spinner" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="grid-empty">
        <div className="grid-empty-icon">💭</div>
        <p className="grid-empty-text">
          {search
            ? `"${search}" bulunamadı.`
            : "henüz hiçbir şey bırakılmamış."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid-section">
      <p className="grid-count">
        {search
          ? `${messages.length} sonuç`
          : `${messages.length} söylenmemiş şey`}
      </p>
      <div className="masonry-grid" ref={gridRef}>
        {messages.map((msg, i) => (
          <MessageCard key={msg.id} msg={msg} index={i} />
        ))}
      </div>
    </div>
  );
}
