import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "https://msnidbqlvjruttajsuhk.supabase.co",
  process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbmlkYnFsdmpydXR0YWpzdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTEwNjUsImV4cCI6MjA5MDM2NzA2NX0.o33Meb-GxnxixWH7kOsbdGI3gWB6d6NBwyeRwK4Eo3Q"
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id")
      .limit(1);

    if (error) throw error;

    res.status(200).json({
      status: "alive",
      timestamp: new Date().toISOString(),
      message: "Supabase connection healthy ✓",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
}
