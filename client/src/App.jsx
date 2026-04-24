import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

import ParticleBackground from "./components/ParticleBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import MessageGrid from "./components/MessageGrid";
import ComposeSheet from "./components/ComposeSheet";
import Footer from "./components/Footer";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState(false);

  /* fetch + realtime */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
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

  const filtered = messages.filter((m) =>
    search.trim() === ""
      ? true
      : (m.to_name || "").toLowerCase().includes(search.toLowerCase()) ||
        m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-root">
      <ParticleBackground />
      <Navbar onCompose={() => setCompose(true)} />

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
    </div>
  );
}