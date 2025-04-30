"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function Reset() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const valid = "/images/valid.svg";

  // get url from token
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) setToken(decodeURIComponent(urlToken));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        token ? "/api/resetPassword" : "/api/auth/forgetPassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(token ? { token, password } : { email }),
        }
      );

      const data = await res.json();

      if (res.status === 200) {
        toast.success(data.message);
        setLoading(true);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("An error has occured.");
    }
  };

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <h2>
          {token ? "Password reset" : "Forgotten password"}
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", }}
        >
          {token ? (
            <input
              placeholder="New passsword"
              className="inputs"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ margin: "10px 0", padding: "8px" }}
            />
          ) : (
            <input
              placeholder="Email"
              className="inputs"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ margin: "10px 0", padding: "8px" }}
            />
          )}

          <button className="button" type="submit" disabled={loading}>
            {loading ? <img src={valid} alt="valid" /> : "Confirm"}
          </button>
        </form>
      </main>
    </div>
  );
}
