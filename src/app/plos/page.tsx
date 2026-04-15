"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const workflows = [
  {
    id: "keyword-clustering",
    icon: "🔑",
    title: "Keyword Clustering",
    badge: "active",
    desc: "Take a broad list of niche-condition related keywords, analyze their intents and organize them thematically into a hierarchy of topics that form highly efficient conversion funnels.",
  },
  {
    id: "competition-scraping",
    icon: "🔍",
    title: "Competition Scraping & Analysis",
    badge: "soon",
    desc: "Scrape and analyze competitor products, positioning, pricing, claims, and reviews to identify market gaps and differentiation opportunities.",
  },
  {
    id: "conversion-funnel",
    icon: "🎯",
    title: "Conversion Funnel Creation",
    badge: "soon",
    desc: "Design and build end-to-end conversion funnels from keyword-driven topic hierarchies, mapping the searcher journey from awareness to purchase.",
  },
  {
    id: "content-development",
    icon: "✍️",
    title: "Content Development",
    badge: "soon",
    desc: "Create hyper-relevant content for each funnel stage — from blog posts and landing pages to product descriptions and ad copy — optimized for search and conversion.",
  },
  {
    id: "multimedia-assets",
    icon: "🎬",
    title: "Multi-Media Assets Development",
    badge: "soon",
    desc: "Develop images, videos, infographics, and other rich media assets aligned with the content strategy and funnel stages.",
  },
  {
    id: "review-generation",
    icon: "⭐",
    title: "Post-Launch Review Generation",
    badge: "soon",
    desc: "Coordinate and manage authentic product review generation across marketplaces after product launch to build social proof and trust.",
  },
  {
    id: "clinical-evidence",
    icon: "🔬",
    title: "Clinical Evidence & Endorsement Generation",
    badge: "soon",
    desc: "Plan and manage clinical studies, collect evidence, and secure professional endorsements to substantiate product claims.",
  },
  {
    id: "ip-development",
    icon: "💡",
    title: "IP Development",
    badge: "soon",
    desc: "Identify, develop, and manage intellectual property — patents, trademarks, trade secrets, and proprietary formulations — to protect competitive advantages.",
  },
  {
    id: "post-launch-improvement",
    icon: "📈",
    title: "Post Launch Improvement",
    badge: "soon",
    desc: "Monitor post-launch performance metrics, customer feedback, and market trends to drive iterative product and content improvements.",
  },
];

const operationsWorkflows = [
  {
    id: "business-operations",
    icon: "⚙️",
    title: "Business Operations",
    badge: "soon",
    desc: "Manage the day-to-day operations of a launched product — inventory, fulfillment, customer service, financials, vendor relationships, and operational workflows.",
  },
  {
    id: "exit-strategy",
    icon: "🚪",
    title: "Exit Strategy",
    badge: "soon",
    desc: "Plan and execute brand exit strategies — including acquisition positioning, licensing opportunities, and portfolio wind-down procedures.",
  },
];

export default function PLOSLandingPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
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

  function handleCardClick(workflow: {
    id: string;
    badge: string;
    title: string;
  }) {
    if (workflow.badge === "active") {
      router.push(`/${workflow.id}`);
      setToast(`Opening ${workflow.title}…`);
      setTimeout(() => setToast(""), 2000);
    } else {
      setToast(`${workflow.title} — coming soon`);
      setTimeout(() => setToast(""), 2000);
    }
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
          background:
            "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
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
        background:
          "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
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
              display: "flex",
              alignItems: "center",
              gap: "6px",
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
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span
            style={{
              fontSize: "36px",
              display: "block",
              marginBottom: "10px",
            }}
          >
            🚀
          </span>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#e6edf3",
              margin: "0 0 6px",
            }}
          >
            Product Launch Operating System
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "#8b949e",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Select a workflow to continue
          </p>
        </div>

        {/* Section: Product Development & Launch */}
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#8b949e",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            marginBottom: "12px",
            paddingLeft: "2px",
          }}
        >
          Product Development &amp; Launch
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {workflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => handleCardClick(wf)}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "10px",
                padding: "24px 22px",
                cursor:
                  wf.badge === "active" ? "pointer" : "not-allowed",
                opacity: wf.badge === "active" ? 1 : 0.5,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                transition:
                  "border-color .2s, transform .15s, box-shadow .2s",
              }}
              onMouseEnter={(e) => {
                if (wf.badge === "active") {
                  e.currentTarget.style.borderColor = "#1f6feb";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,.35)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#30363d";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "22px", flexShrink: 0 }}>
                  {wf.icon}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#e6edf3",
                  }}
                >
                  {wf.title}
                </span>
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "2px 7px",
                    borderRadius: "3px",
                    marginLeft: "auto",
                    flexShrink: 0,
                    background:
                      wf.badge === "active"
                        ? "rgba(31,111,235,.2)"
                        : "rgba(139,148,158,.15)",
                    color:
                      wf.badge === "active" ? "#58a6ff" : "#8b949e",
                  }}
                >
                  {wf.badge === "active" ? "Active" : "Coming Soon"}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#8b949e",
                  lineHeight: 1.55,
                }}
              >
                {wf.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #21262d",
            margin: "28px 0 4px",
          }}
        />

        {/* Section: Ongoing Operations */}
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#8b949e",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            margin: "32px 0 12px",
            paddingLeft: "2px",
          }}
        >
          Ongoing Operations
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {operationsWorkflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => handleCardClick(wf)}
              style={{
                background: "#1a2332",
                border: "1px solid rgba(31,111,235,.27)",
                borderRadius: "10px",
                padding: "28px 26px",
                cursor: "not-allowed",
                opacity: 0.55,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "26px", flexShrink: 0 }}>
                  {wf.icon}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#e6edf3",
                  }}
                >
                  {wf.title}
                </span>
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "2px 7px",
                    borderRadius: "3px",
                    marginLeft: "auto",
                    flexShrink: 0,
                    background: "rgba(139,148,158,.15)",
                    color: "#8b949e",
                  }}
                >
                  Coming Soon
                </span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#8b949e",
                  lineHeight: 1.55,
                }}
              >
                {wf.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "10px 20px",
            color: "#e6edf3",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,.5)",
            zIndex: 1000,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
