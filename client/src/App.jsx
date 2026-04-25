import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

import ParticleBackground from "./components/ParticleBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import MessageGrid from "./components/MessageGrid";
import ComposeSheet from "./components/ComposeSheet";
import RandomReveal from "./components/RandomReveal";
import StatsModal from "./components/StatsModal";
import Footer from "./components/Footer";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState(false);
  const [randomOpen, setRandomOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  /* fetch + realtime */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setMessages(data);
      setLoading(false);
    })();

    const ch = supabase
      .channel("msgs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (p) => setMessages((prev) => [p.new, ...prev])
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []);

  const filtered = messages.filter((m) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (m.to_name || "").toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="app-root">
      <ParticleBackground />
      <Navbar
        onCompose={() => setCompose(true)}
        onRandom={() => setRandomOpen(true)}
        onStats={() => setStatsOpen(true)}
      />

      <main>
        <Hero messageCount={messages.length} />
        <SearchBar value={search} onChange={setSearch} />
        <MessageGrid
          messages={filtered}
          search={search}
          loading={loading}
        />
      </main>

      <Footer />

      <ComposeSheet
        open={compose}
        onClose={() => setCompose(false)}
      />

      <RandomReveal
        open={randomOpen}
        onClose={() => setRandomOpen(false)}
      />

      <StatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        messages={messages}
      />
    </div>
  );
}