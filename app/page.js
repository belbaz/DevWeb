"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState(". . .");
  const [messageSupabase, setMessageSupabase] = useState(". . .");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await fetch("/api/hello");
        const data1 = await res1.json();
        setMessage(data1.message);

        const res2 = await fetch("/api/supabase");
        if (res2.ok) {
          setMessageSupabase(await res2.json());
        } else if (res2.status === 500) {
          setMessageSupabase(
            "Error while connecting : Supabase DB unavailable !"
          );
        } else {
          setMessageSupabase("Error while connecting to DB");
        }
      } catch (error) {
        setMessageSupabase("Error while connecting to DB");
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      <h1>Welcome to musehome !</h1>
      <p>{message}</p>
      <p>{messageSupabase}</p>
    </main>
  );
}
