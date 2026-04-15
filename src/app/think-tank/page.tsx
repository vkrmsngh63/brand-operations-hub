"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ThinkTankLandingPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
          color: "#8b949e",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
        overflowY: "auto",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "48px 32px 64px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#8b949e",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#8b949e",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>
            💡
          </span>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#e6edf3",
              margin: "0 0 8px",
            }}
          >
            Think Tank
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#8b949e",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Capture ideas &amp; develop strategic concepts
          </p>
        </div>

        {/* Coming soon content */}
        <div
          style={{
            textAlign: "center",
            padding: "64px 32px",
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "12px",
          }}
        >
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</p>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#e6edf3",
              marginBottom: "8px",
            }}
          >
            Under Construction
          </h2>
          <p style={{ fontSize: "13px", color: "#8b949e", lineHeight: 1.6 }}>
            The Think Tank workspace is being built. Project management, nesting, Admin Notes, and multimedia features are coming in the next update.
          </p>
        </div>
      </div>
    </div>
  );
}
