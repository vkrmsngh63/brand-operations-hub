"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
      }}
    >
      <div
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-dark)",
          borderRadius: "12px",
          padding: "48px 44px",
          width: "390px",
          boxShadow: "0 30px 90px rgba(0,0,0,.7)",
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span style={{ fontSize: "34px", display: "block", marginBottom: "10px" }}>
            🛠️
          </span>
          <h1
            style={{
              fontSize: "19px",
              fontWeight: 700,
              color: "var(--text-bright)",
              margin: 0,
            }}
          >
            Brand Operations Hub
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-light)",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              marginTop: "5px",
            }}
          >
            Internal Access Only
          </p>
        </div>

        {/* Email field */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-light)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "7px",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter email"
            style={{
              width: "100%",
              padding: "11px 14px",
              background: "var(--bg-app)",
              border: "1px solid var(--border-dark)",
              borderRadius: "6px",
              color: "var(--text-bright)",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-light)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "7px",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "11px 14px",
              background: "var(--bg-app)",
              border: "1px solid var(--border-dark)",
              borderRadius: "6px",
              color: "var(--text-bright)",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Sign In button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            background: "var(--accent)",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            letterSpacing: ".3px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign In →"}
        </button>

        {/* Error message */}
        {error && (
          <div
            style={{
              marginTop: "14px",
              padding: "8px 12px",
              background: "rgba(248,81,73,.1)",
              border: "1px solid rgba(248,81,73,.3)",
              borderRadius: "5px",
              color: "#ffa198",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}