"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

interface TTProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  status: "inactive" | "active" | "completed";
  parentId: string | null;
  sortOrder: number;
  lastUpdated: string;
}

type StatusFilter = "all" | "inactive" | "active" | "completed";

const LS_KEY = "think_tank_projects";
const THUMB_SIZE = 120;

function genId() {
  return "tt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

function loadProjects(): TTProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: TTProject[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(projects));
}

/* ── Resize image to thumbnail ── */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = THUMB_SIZE;
        canvas.height = THUMB_SIZE;
        const ctx = canvas.getContext("2d")!;
        // Cover-fit: crop to center square, then draw
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, THUMB_SIZE, THUMB_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Build a flat ordered list respecting tree hierarchy ── */
function buildTreeOrder(projects: TTProject[], filter: StatusFilter): TTProject[] {
  const byParent = new Map<string | null, TTProject[]>();
  for (const p of projects) {
    const key = p.parentId ?? "__root__";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(p);
  }
  // Sort children by sortOrder
  for (const children of byParent.values()) {
    children.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const result: TTProject[] = [];
  function walk(parentId: string | null) {
    const children = byParent.get(parentId ?? "__root__") || [];
    for (const child of children) {
      result.push(child);
      walk(child.id);
    }
  }
  walk(null);

  if (filter === "all") return result;
  // When filtering, include a project if it OR any ancestor matches
  const matchIds = new Set(projects.filter((p) => p.status === filter).map((p) => p.id));
  // Also include ancestors of matching projects
  const includeIds = new Set<string>();
  for (const id of matchIds) {
    let cur: TTProject | undefined = projects.find((p) => p.id === id);
    while (cur) {
      includeIds.add(cur.id);
      cur = cur.parentId ? projects.find((p) => p.id === cur!.parentId) : undefined;
    }
  }
  // Also include children of matching projects
  function addChildren(pid: string) {
    const ch = byParent.get(pid) || [];
    for (const c of ch) {
      includeIds.add(c.id);
      addChildren(c.id);
    }
  }
  for (const id of matchIds) addChildren(id);

  return result.filter((p) => includeIds.has(p.id));
}

function getDepth(projects: TTProject[], projectId: string): number {
  let depth = 0;
  let cur = projects.find((p) => p.id === projectId);
  while (cur?.parentId) {
    depth++;
    cur = projects.find((p) => p.id === cur!.parentId);
  }
  return depth;
}

function isDescendant(projects: TTProject[], ancestorId: string, targetId: string): boolean {
  let cur = projects.find((p) => p.id === targetId);
  while (cur?.parentId) {
    if (cur.parentId === ancestorId) return true;
    cur = projects.find((p) => p.id === cur!.parentId);
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════════
   PROJECT MODAL (Create / Edit)
   ═══════════════════════════════════════════════════════════════ */

function ProjectModal({
  project,
  onSave,
  onClose,
}: {
  project: TTProject | null; // null = create new
  onSave: (data: { title: string; description: string; thumbnail: string | null; status: TTProject["status"] }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [thumbnail, setThumbnail] = useState<string | null>(project?.thumbnail || null);
  const [status, setStatus] = useState<TTProject["status"]>(project?.status || "inactive");
  const fileRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      setThumbnail(resized);
    } catch {
      alert("Failed to process image. Please try a different file.");
    }
  }

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
          width: "500px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,.7)",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#e6edf3", marginBottom: "24px" }}>
          {project ? "Edit Project" : "New Project"}
        </h3>

        {/* Title */}
        <label style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title…"
          style={inputStyle}
          autoFocus
        />

        {/* Description */}
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description…"
          rows={3}
          style={{ ...textareaStyle, marginBottom: "18px" }}
        />

        {/* Thumbnail */}
        <label style={labelStyle}>Thumbnail Image</label>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              border: "1px solid #30363d",
              background: "#0d1117",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {thumbnail ? (
              <img src={thumbnail} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "28px", opacity: 0.3 }}>📷</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ ...btnSecondary, padding: "6px 14px", fontSize: "12px" }}
            >
              {thumbnail ? "Change Image" : "Upload Image"}
            </button>
            {thumbnail && (
              <button
                onClick={() => setThumbnail(null)}
                style={{ ...btnSecondary, padding: "4px 10px", fontSize: "11px", color: "#f87171" }}
              >
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>

        {/* Status */}
        <label style={labelStyle}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TTProject["status"])}
          style={{
            ...inputStyle,
            cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b949e'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "32px",
          }}
        >
          <option value="inactive">Inactive</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button
            onClick={() => {
              if (!title.trim()) return;
              onSave({ title: title.trim(), description: description.trim(), thumbnail, status });
            }}
            style={btnPrimary}
          >
            {project ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  color: "#8b949e",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
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
};

const textareaStyle: React.CSSProperties = {
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
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 18px",
  background: "#1f6feb",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 18px",
  background: "transparent",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "#8b949e",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const STATUS_COLORS: Record<TTProject["status"], { bg: string; color: string; label: string }> = {
  inactive: { bg: "rgba(139,148,158,.15)", color: "#8b949e", label: "Inactive" },
  active: { bg: "rgba(31,111,235,.2)", color: "#58a6ff", label: "Active" },
  completed: { bg: "rgba(63,185,80,.2)", color: "#3fb950", label: "Completed" },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function ThinkTankLandingPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<TTProject[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; project: TTProject | null } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; zone: "before" | "after" | "child" } | null>(null);
  const [toast, setToast] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        setProjects(loadProjects());
        setLoading(false);
      }
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  /* ── CRUD ── */
  function handleCreateProject(data: { title: string; description: string; thumbnail: string | null; status: TTProject["status"] }) {
    const newProject: TTProject = {
      id: genId(),
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      status: data.status,
      parentId: null,
      sortOrder: projects.filter((p) => p.parentId === null).length,
      lastUpdated: new Date().toISOString(),
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    saveProjects(updated);
    setModal(null);
  }

  function handleEditProject(data: { title: string; description: string; thumbnail: string | null; status: TTProject["status"] }) {
    if (!modal?.project) return;
    const updated = projects.map((p) =>
      p.id === modal.project!.id
        ? { ...p, ...data, lastUpdated: new Date().toISOString() }
        : p
    );
    setProjects(updated);
    saveProjects(updated);
    setModal(null);
  }

  function handleDeleteProject(id: string) {
    if (!confirm("Delete this project and all its nested sub-projects?")) return;
    // Collect all descendants
    const toDelete = new Set<string>();
    function collectChildren(pid: string) {
      toDelete.add(pid);
      projects.filter((p) => p.parentId === pid).forEach((p) => collectChildren(p.id));
    }
    collectChildren(id);
    const updated = projects.filter((p) => !toDelete.has(p.id));
    setProjects(updated);
    saveProjects(updated);
  }

  /* ── DRAG & DROP ── */
  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    if (isDescendant(projects, dragId, targetId)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const third = rect.height / 3;

    let zone: "before" | "after" | "child";
    if (y < third) zone = "before";
    else if (y > third * 2) zone = "after";
    else zone = "child";

    setDropTarget({ id: targetId, zone });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragId || !dropTarget) {
      setDragId(null);
      setDropTarget(null);
      return;
    }

    const target = projects.find((p) => p.id === dropTarget.id);
    if (!target) { setDragId(null); setDropTarget(null); return; }

    let updated = projects.map((p) => ({ ...p }));
    const dragProject = updated.find((p) => p.id === dragId)!;

    if (dropTarget.zone === "child") {
      // Make child of target
      dragProject.parentId = target.id;
      const siblings = updated.filter((p) => p.parentId === target.id && p.id !== dragId);
      dragProject.sortOrder = siblings.length;
    } else {
      // Insert before/after target as sibling
      dragProject.parentId = target.parentId;
      const siblings = updated
        .filter((p) => p.parentId === target.parentId && p.id !== dragId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const targetIdx = siblings.findIndex((p) => p.id === target.id);
      const insertIdx = dropTarget.zone === "before" ? targetIdx : targetIdx + 1;

      siblings.splice(insertIdx, 0, dragProject);
      siblings.forEach((p, i) => (p.sortOrder = i));
    }

    dragProject.lastUpdated = new Date().toISOString();
    setProjects(updated);
    saveProjects(updated);
    setDragId(null);
    setDropTarget(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setDropTarget(null);
  }

  /* ── COLLAPSE ── */
  function toggleCollapse(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function hasChildren(id: string): boolean {
    return projects.some((p) => p.parentId === id);
  }

  /* ── Visibility (respect collapsed parents) ── */
  function isHiddenByCollapse(projectId: string): boolean {
    let cur = projects.find((p) => p.id === projectId);
    while (cur?.parentId) {
      if (collapsedIds.has(cur.parentId)) return true;
      cur = projects.find((p) => p.id === cur!.parentId);
    }
    return false;
  }

  /* ── BUILD DISPLAY LIST ── */
  const displayList = buildTreeOrder(projects, filter).filter((p) => !isHiddenByCollapse(p.id));

  /* ── Drop indicator style ── */
  function getDropStyle(id: string): React.CSSProperties {
    if (!dropTarget || dropTarget.id !== id) return {};
    if (dropTarget.zone === "before") return { borderTop: "2px solid #58a6ff" };
    if (dropTarget.zone === "after") return { borderBottom: "2px solid #58a6ff" };
    return { outline: "2px solid #58a6ff", outlineOffset: "-2px" };
  }

  /* ── Time ago ── */
  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  if (loading) {
    return (
      <div
        style={{
          position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
          color: "#8b949e", fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
        overflowY: "auto", fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px 64px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={btnSecondary}>← Back</button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => showToast("Admin Notes — coming in next update")}
              style={{ ...btnSecondary, display: "flex", alignItems: "center", gap: "6px" }}
            >
              📝 Admin Notes
            </button>
            <button onClick={handleLogout} style={btnSecondary}>Sign Out</button>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>💡</span>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#e6edf3", margin: "0 0 8px" }}>
            Think Tank
          </h1>
          <p style={{ fontSize: "12px", color: "#8b949e", letterSpacing: "1.4px", textTransform: "uppercase", margin: 0 }}>
            Capture ideas &amp; develop strategic concepts
          </p>
        </div>

        {/* Action bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          {/* Status filter */}
          <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid #30363d" }}>
            {(["all", "active", "inactive", "completed"] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  border: "none",
                  borderLeft: f !== "all" ? "1px solid #30363d" : "none",
                  cursor: "pointer",
                  background: filter === f ? "#1f6feb" : "#161b22",
                  color: filter === f ? "#fff" : "#8b949e",
                  transition: "all .2s",
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setModal({ mode: "create", project: null })}
            style={btnPrimary}
          >
            + New Project
          </button>
        </div>

        {/* Your Projects */}
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
          Your Projects
          <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: "none", marginLeft: "8px" }}>
            ({displayList.length})
          </span>
        </div>

        {/* Project List */}
        {displayList.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 32px",
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "12px",
            }}
          >
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>📁</p>
            <p style={{ fontSize: "14px", color: "#8b949e" }}>
              {projects.length === 0
                ? "No projects yet. Create one to get started."
                : "No projects match the current filter."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {displayList.map((project) => {
              const depth = getDepth(projects, project.id);
              const isHov = hovered === project.id;
              const isDragging = dragId === project.id;
              const hasCh = hasChildren(project.id);
              const isCollapsed = collapsedIds.has(project.id);
              const st = STATUS_COLORS[project.status];

              return (
                <div
                  key={project.id}
                  draggable
                  onDragStart={() => handleDragStart(project.id)}
                  onDragOver={(e) => handleDragOver(e, project.id)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHovered(project.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    marginLeft: depth * 28,
                    background: isHov ? "#f0f6ff" : "#161b22",
                    border: `1px solid ${isHov ? "#3b82f6" : "#30363d80"}`,
                    borderRadius: "8px",
                    opacity: isDragging ? 0.4 : 1,
                    transition: "all .2s ease",
                    cursor: "grab",
                    ...getDropStyle(project.id),
                  }}
                >
                  {/* Drag Handle */}
                  <span style={{ color: isHov ? "#64748b" : "#484f58", fontSize: "14px", flexShrink: 0, cursor: "grab", userSelect: "none" }}>
                    ⋮⋮
                  </span>

                  {/* Collapse toggle */}
                  <span
                    onClick={(e) => { e.stopPropagation(); if (hasCh) toggleCollapse(project.id); }}
                    style={{
                      width: "16px",
                      fontSize: "10px",
                      color: isHov ? "#475569" : "#8b949e",
                      cursor: hasCh ? "pointer" : "default",
                      userSelect: "none",
                      flexShrink: 0,
                      textAlign: "center",
                    }}
                  >
                    {hasCh ? (isCollapsed ? "▶" : "▼") : ""}
                  </span>

                  {/* Thumbnail */}
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "6px",
                      border: `1px solid ${isHov ? "#cbd5e1" : "#30363d"}`,
                      background: isHov ? "#e2e8f0" : "#0d1117",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "18px", opacity: 0.3 }}>💡</span>
                    )}
                  </div>

                  {/* Title + Description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: isHov ? "#0f172a" : "#e6edf3", lineHeight: 1.3 }}>
                      {project.title}
                    </div>
                    {project.description && (
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: isHov ? "#475569" : "#8b949e",
                          lineHeight: 1.4,
                          marginTop: "3px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.description}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      flexShrink: 0,
                      background: isHov
                        ? (project.status === "active" ? "rgba(37,99,235,.12)" : project.status === "completed" ? "rgba(22,163,74,.12)" : "rgba(100,116,139,.12)")
                        : st.bg,
                      color: isHov
                        ? (project.status === "active" ? "#1d4ed8" : project.status === "completed" ? "#15803d" : "#475569")
                        : st.color,
                    }}
                  >
                    {st.label}
                  </span>

                  {/* Last updated */}
                  <span style={{ fontSize: "11px", color: isHov ? "#64748b" : "#484f58", flexShrink: 0, minWidth: "60px", textAlign: "right" }}>
                    {timeAgo(project.lastUpdated)}
                  </span>

                  {/* Action buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      opacity: isHov ? 1 : 0,
                      transition: "opacity .15s",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setModal({ mode: "edit", project }); }}
                      title="Edit"
                      style={{
                        background: isHov ? "rgba(0,0,0,.06)" : "transparent",
                        border: "none",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                      title="Delete"
                      style={{
                        background: isHov ? "rgba(0,0,0,.06)" : "transparent",
                        border: "none",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drag hint */}
        {projects.length > 0 && (
          <p style={{ fontSize: "11px", color: "#484f58", marginTop: "16px", textAlign: "center" }}>
            Drag projects to reorder. Drop on the middle of another project to nest it underneath.
          </p>
        )}
      </div>

      {/* Toast */}
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

      {/* Project Modal */}
      {modal && (
        <ProjectModal
          project={modal.project}
          onSave={modal.mode === "create" ? handleCreateProject : handleEditProject}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
