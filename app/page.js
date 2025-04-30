"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState(". . .");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/supabase");
        if (res.ok) {
          setMessage(await res.json());
        } else if (res.status === 500) {
          setMessage(
            "Error while connecting : Supabase DB unavailable !"
          );
        } else {
          setMessage("Error while connecting to DB");
        }
      } catch (error) {
        setMessage("Error while connecting to DB");
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      <h1>Welcome to musehome !</h1>
      <p>{message}</p>
    </main>
  );
}
