import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://msnidbqlvjruttajsuhk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbmlkYnFsdmpydXR0YWpzdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTEwNjUsImV4cCI6MjA5MDM2NzA2NX0.o33Meb-GxnxixWH7kOsbdGI3gWB6d6NBwyeRwK4Eo3Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
