"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/* ── Default card data ── */
const DEFAULT_CARDS = [
  {
    id: "plos",
    icon: "🚀",
    title: "Product Launch Operating System",
    description:
      "End-to-end product launch workflows — from keyword research and competitive analysis through content development, marketplace launch, and post-launch optimization.",
    route: "/plos",
  },
  {
    id: "pms",
    icon: "📋",
    title: "Project Management System",
    description:
      "Coordinate teams, track tasks, manage timelines, and oversee project deliverables across all product launch operations.",
    route: "/pms",
  },
  {
    id: "think-tank",
    icon: "💡",
    title: "Think Tank",
    description:
      "Capture ideas, organize research, and develop strategic concepts in a flexible project-based workspace.",
    route: "/think-tank",
  },
];

const LS_KEY = "plos_initial_cards";

function loadCards() {
  if (typeof window === "undefined") return DEFAULT_CARDS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Merge saved data with defaults (preserves route/icon, allows new defaults to be added)
      return DEFAULT_CARDS.map((def) => {
        const match = saved.find((s: { id: string }) => s.id === def.id);
        return match ? { ...def, title: match.title, description: match.description } : def;
      });
    }
  } catch { /* ignore */ }
  return DEFAULT_CARDS;
}

function saveCards(cards: typeof DEFAULT_CARDS) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify(cards.map(({ id, title, description }) => ({ id, title, description })))
  );
}

/* ── Edit Modal ── */
function EditModal({
  card,
  onSave,
  onClose,
}: {
  card: (typeof DEFAULT_CARDS)[0];
  onSave: (title: string, description: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description);
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "12px",
          padding: "32px",
          width: "480px",
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,.7)",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#e6edf3",
            marginBottom: "24px",
          }}
        >
          Edit Card — {card.icon}
        </h3>

        {/* Title */}
        <label
          style={{
            display: "block",
            fontSize: "10px",
            fontWeight: 600,
            color: "#8b949e",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#e6edf3",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "18px",
          }}
        />

        {/* Description */}
        <label
          style={{
            display: "block",
            fontSize: "10px",
            fontWeight: 600,
            color: "#8b949e",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Description
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#e6edf3",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            lineHeight: 1.5,
            outline: "none",
            boxSizing: "border-box",
            resize: "vertical",
            marginBottom: "24px",
          }}
        />

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              background: "transparent",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#8b949e",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(title.trim(), desc.trim())}
            style={{
              padding: "8px 18px",
              background: "#1f6feb",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [editingCard, setEditingCard] = useState<(typeof DEFAULT_CARDS)[0] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        setCards(loadCards());
        setLoading(false);
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleSaveCard(title: string, description: string) {
    if (!editingCard) return;
    const updated = cards.map((c) =>
      c.id === editingCard.id ? { ...c, title: title || c.title, description: description || c.description } : c
    );
    setCards(updated);
    saveCards(updated);
    setEditingCard(null);
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
          maxWidth: "960px",
          margin: "0 auto",
          padding: "48px 32px 64px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
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
          <span
            style={{
              fontSize: "40px",
              display: "block",
              marginBottom: "12px",
            }}
          >
            🚀
          </span>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#e6edf3",
              margin: "0 0 8px",
            }}
          >
            Product Launch Operating System
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
            Select a system to continue
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                position: "relative",
                background: hovered === card.id ? "#1c2333" : "#161b22",
                border: `1px solid ${hovered === card.id ? "#1f6feb" : "#30363d"}`,
                borderRadius: "12px",
                padding: "32px 24px 28px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "14px",
                transition: "all .2s ease",
                transform: hovered === card.id ? "translateY(-3px)" : "none",
                boxShadow: hovered === card.id ? "0 12px 32px rgba(0,0,0,.4)" : "none",
                minHeight: "220px",
              }}
              onMouseEnter={() => setHovered(card.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push(card.route)}
            >
              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCard(card);
                }}
                title="Edit card"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  color: "#484f58",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  opacity: hovered === card.id ? 1 : 0,
                  transition: "opacity .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#e6edf3";
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#484f58";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ✏️
              </button>

              {/* Icon */}
              <span style={{ fontSize: "36px" }}>{card.icon}</span>

              {/* Title */}
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#e6edf3",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {card.title}
              </h2>

              {/* Description */}
              <p
                style={{
                  fontSize: "12px",
                  color: "#8b949e",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <EditModal
          card={editingCard}
          onSave={handleSaveCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
