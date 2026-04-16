"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/authFetch";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
  createdAt: string;
}

interface Note {
  id: string;
  userId: string;
  system: string;
  title: string;
  content: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}

type SystemKey = "think-tank" | "pms";

interface AdminNotesProps {
  system: SystemKey;
  systemLabel: string;      // e.g. "Think Tank"
  systemIcon: string;       // e.g. "💡"
  backRoute: string;        // e.g. "/think-tank"
}

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */

const btnPrimary: React.CSSProperties = {
  padding: "8px 16px", background: "#1f6feb", border: "none", borderRadius: "6px",
  color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 16px", background: "transparent", border: "1px solid #30363d",
  borderRadius: "6px", color: "#8b949e", fontSize: "13px", fontWeight: 600,
  cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(type: string): boolean {
  return type.startsWith("image/");
}

function isVideo(type: string): boolean {
  return type.startsWith("video/");
}

/* ═══════════════════════════════════════════════════════════════
   LIGHTBOX VIEWER
   ═══════════════════════════════════════════════════════════════ */

function LightboxViewer({ attachment, onClose }: { attachment: Attachment; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.85)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        padding: "32px", cursor: "pointer",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: "20px", right: "24px",
          background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)",
          color: "#fff", fontSize: "20px", width: "40px", height: "40px",
          borderRadius: "20px", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        ×
      </button>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
        {isImage(attachment.fileType) ? (
          <img
            src={attachment.publicUrl}
            alt={attachment.fileName}
            style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: "8px" }}
          />
        ) : isVideo(attachment.fileType) ? (
          <video
            src={attachment.publicUrl}
            controls
            autoPlay
            style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "8px" }}
          />
        ) : null}
        <p style={{ color: "#c9d1d9", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>
          {attachment.fileName} · {formatFileSize(attachment.fileSize)}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminNotes({ system, systemLabel, systemIcon, backRoute }: AdminNotesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<Attachment | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ── AUTH CHECK & LOAD NOTES ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/"); return; }
      fetchNotes();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, system]);

  async function fetchNotes() {
    try {
      const res = await authFetch(`/api/admin-notes?system=${system}`);
      if (!res.ok) throw new Error("Failed to load notes");
      const data: Note[] = await res.json();
      setNotes(data);
      if (data.length > 0 && !activeNoteId) setActiveNoteId(data[0].id);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  /* ── CREATE NOTE ── */
  async function createNote() {
    try {
      const res = await authFetch("/api/admin-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, title: "Untitled Note" }),
      });
      if (!res.ok) throw new Error("Create failed");
      const newNote: Note = await res.json();
      setNotes((prev) => [...prev, newNote]);
      setActiveNoteId(newNote.id);
      setRenamingId(newNote.id);
      setRenameValue(newNote.title);
    } catch (err) {
      console.error(err);
      setError("Failed to create note.");
    }
  }

  /* ── DELETE NOTE ── */
  async function deleteNote(id: string) {
    if (!confirm("Delete this note and all its attachments? This cannot be undone.")) return;
    try {
      const res = await authFetch(`/api/admin-notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      const remaining = notes.filter((n) => n.id !== id);
      setNotes(remaining);
      if (activeNoteId === id) {
        setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete note.");
    }
  }

  /* ── AUTO-SAVE CONTENT ── */
  const scheduleSave = useCallback((noteId: string, updates: { title?: string; content?: string }) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await authFetch(`/api/admin-notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Save failed");
        const updated: Note = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
        setSaveStatus("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
      } catch (err) {
        console.error(err);
        setSaveStatus("idle");
        setError("Failed to save changes.");
      }
    }, 800);
  }, []);

  /* ── TITLE EDITING ── */
  function startRename(note: Note) {
    setRenamingId(note.id);
    setRenameValue(note.title);
  }

  function commitRename() {
    if (!renamingId) return;
    const title = renameValue.trim() || "Untitled Note";
    setNotes((prev) => prev.map((n) => (n.id === renamingId ? { ...n, title } : n)));
    scheduleSave(renamingId, { title });
    setRenamingId(null);
  }

  /* ── CONTENT EDITING ── */
  function handleContentChange(content: string) {
    if (!activeNote) return;
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? { ...n, content } : n)));
    scheduleSave(activeNote.id, { content });
  }

  /* ── ATTACHMENT UPLOAD ── */
  async function uploadFiles(files: FileList | File[]) {
    if (!activeNote || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await authFetch(`/api/admin-notes/${activeNote.id}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (data.errors && data.errors.length > 0) {
        setError(
          `Some files failed: ${data.errors.map((e: { fileName: string; error: string }) => `${e.fileName} (${e.error})`).join(", ")}`
        );
      }

      // Reload note to get fresh attachment list
      const noteRes = await authFetch(`/api/admin-notes/${activeNote.id}`);
      if (noteRes.ok) {
        const updated: Note = await noteRes.json();
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload files.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteAttachment(attachmentId: string) {
    if (!activeNote) return;
    if (!confirm("Delete this attachment?")) return;
    try {
      const res = await authFetch(`/api/admin-notes/${activeNote.id}/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNote.id
            ? { ...n, attachments: n.attachments.filter((a) => a.id !== attachmentId) }
            : n
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete attachment.");
    }
  }

  /* ── DRAG & DROP ── */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (!activeNote) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) uploadFiles(files);
  }

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
        color: "#8b949e", fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        Loading notes…
      </div>
    );
  }

  /* ── MAIN LAYOUT ── */
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse at 35% 40%, #0d2a4a 0%, #0d1117 65%)",
        fontFamily: "'IBM Plex Sans', sans-serif",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* ── TOP BAR ── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 24px", borderBottom: "1px solid #21262d",
          background: "rgba(13,17,23,.6)", backdropFilter: "blur(8px)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button onClick={() => router.push(backRoute)} style={btnSecondary}>← Back</button>
          <div style={{ width: "1px", height: "24px", background: "#30363d" }} />
          <span style={{ fontSize: "22px" }}>{systemIcon}</span>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#e6edf3", margin: 0, lineHeight: 1.2 }}>
              {systemLabel} · Admin Notes
            </h1>
            <p style={{ fontSize: "10px", color: "#8b949e", margin: "2px 0 0", letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Personal workspace
            </p>
          </div>
        </div>

        {/* Save status */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {saveStatus === "saving" && (
            <span style={{ fontSize: "11px", color: "#d4a72c", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d4a72c", animation: "pulse 1s infinite" }} />
              Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ fontSize: "11px", color: "#3fb950", display: "flex", alignItems: "center", gap: "6px" }}>
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      {/* ── ERROR TOAST ── */}
      {error && (
        <div
          style={{
            position: "fixed", top: "80px", right: "24px", zIndex: 999,
            background: "rgba(248,81,73,.1)", border: "1px solid rgba(248,81,73,.4)",
            padding: "10px 14px", borderRadius: "6px", color: "#ffa198", fontSize: "12px",
            maxWidth: "320px", boxShadow: "0 8px 24px rgba(0,0,0,.4)",
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", color: "#ffa198", marginLeft: "10px", cursor: "pointer", fontSize: "14px" }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── MAIN AREA: sidebar + editor ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* ─── SIDEBAR: Note list ─── */}
        <div
          style={{
            width: "280px", borderRight: "1px solid #21262d",
            display: "flex", flexDirection: "column",
            background: "rgba(22,27,34,.4)", flexShrink: 0,
          }}
        >
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #21262d" }}>
            <button
              onClick={createNote}
              style={{ ...btnPrimary, width: "100%", padding: "9px 14px", fontSize: "13px" }}
            >
              + New Note
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {notes.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "#484f58", fontSize: "12px" }}>
                No notes yet.<br />Click &quot;+ New Note&quot; to create one.
              </div>
            ) : (
              notes.map((note) => {
                const isActive = activeNoteId === note.id;
                const isRenaming = renamingId === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => !isRenaming && setActiveNoteId(note.id)}
                    style={{
                      padding: "10px 12px", borderRadius: "6px", marginBottom: "3px",
                      cursor: isRenaming ? "text" : "pointer",
                      background: isActive ? "rgba(31,111,235,.18)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(31,111,235,.4)" : "transparent"}`,
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {isRenaming ? (
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "100%", padding: "4px 6px",
                          background: "#0d1117", border: "1px solid #1f6feb", borderRadius: "4px",
                          color: "#e6edf3", fontSize: "13px", fontWeight: 600,
                          fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", fontWeight: 600, color: isActive ? "#e6edf3" : "#c9d1d9", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {note.title}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <span style={{ fontSize: "10px", color: "#6e7681" }}>
                        {timeAgo(note.updatedAt)}
                      </span>
                      {note.attachments.length > 0 && (
                        <span style={{ fontSize: "9px", color: "#6e7681", display: "flex", alignItems: "center", gap: "2px" }}>
                          📎 {note.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── EDITOR PANE ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {!activeNote ? (
            <div
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: "12px", color: "#484f58",
              }}
            >
              <span style={{ fontSize: "48px", opacity: 0.4 }}>📝</span>
              <p style={{ fontSize: "14px" }}>
                {notes.length === 0 ? "Create a note to get started" : "Select a note from the sidebar"}
              </p>
            </div>
          ) : (
            <>
              {/* Note header */}
              <div
                style={{
                  padding: "20px 32px 16px", borderBottom: "1px solid #21262d",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <div
                  onClick={() => startRename(activeNote)}
                  style={{
                    flex: 1, fontSize: "20px", fontWeight: 700, color: "#e6edf3",
                    cursor: "text", padding: "4px 6px", borderRadius: "4px",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  title="Click to rename"
                >
                  {activeNote.title}
                </div>
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  title="Delete note"
                  style={{
                    background: "transparent", border: "1px solid #30363d",
                    color: "#8b949e", padding: "6px 12px", borderRadius: "6px",
                    fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#f85149";
                    e.currentTarget.style.color = "#ffa198";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#30363d";
                    e.currentTarget.style.color = "#8b949e";
                  }}
                >
                  🗑️ Delete note
                </button>
              </div>

              {/* Scroll area: textarea + attachments */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  flex: 1, overflowY: "auto", padding: "24px 32px 32px",
                  position: "relative",
                }}
              >
                {dragOver && (
                  <div
                    style={{
                      position: "absolute", inset: "16px", borderRadius: "12px",
                      border: "2px dashed #58a6ff", background: "rgba(31,111,235,.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none", zIndex: 5,
                      color: "#58a6ff", fontSize: "14px", fontWeight: 600,
                    }}
                  >
                    Drop files to upload
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing your notes here…"
                  style={{
                    width: "100%", minHeight: "280px", padding: "16px 18px",
                    background: "#0d1117", border: "1px solid #21262d", borderRadius: "10px",
                    color: "#e6edf3", fontFamily: "inherit", fontSize: "14px",
                    lineHeight: 1.65, outline: "none", resize: "vertical",
                    marginBottom: "28px", boxSizing: "border-box",
                  }}
                />

                {/* Attachments header */}
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#8b949e", letterSpacing: "1.4px", textTransform: "uppercase" }}>
                    Attachments ({activeNote.attachments.length})
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      ...btnSecondary,
                      padding: "6px 14px", fontSize: "12px",
                      opacity: uploading ? 0.6 : 1,
                      cursor: uploading ? "wait" : "pointer",
                    }}
                  >
                    {uploading ? "Uploading…" : "+ Upload files"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) uploadFiles(e.target.files);
                      e.target.value = "";
                    }}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Attachment grid */}
                {activeNote.attachments.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 20px", textAlign: "center",
                      border: "1px dashed #21262d", borderRadius: "10px",
                      color: "#6e7681", fontSize: "12px",
                    }}
                  >
                    No attachments. Drag &amp; drop files here, or click &quot;+ Upload files&quot; above.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {activeNote.attachments.map((att) => (
                      <div
                        key={att.id}
                        style={{
                          position: "relative",
                          background: "#161b22", border: "1px solid #30363d",
                          borderRadius: "8px", overflow: "hidden",
                          transition: "all .15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#484f58"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#30363d"; }}
                      >
                        {/* Preview */}
                        <div
                          onClick={() => setLightbox(att)}
                          style={{
                            height: "140px", background: "#0d1117", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            position: "relative", overflow: "hidden",
                          }}
                        >
                          {isImage(att.fileType) ? (
                            <img
                              src={att.publicUrl}
                              alt={att.fileName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : isVideo(att.fileType) ? (
                            <>
                              <video
                                src={att.publicUrl}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              <div style={{
                                position: "absolute", inset: 0,
                                background: "rgba(0,0,0,.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: "32px",
                              }}>
                                ▶
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: "36px" }}>📄</span>
                          )}
                        </div>

                        {/* Info + delete */}
                        <div style={{ padding: "8px 10px" }}>
                          <div
                            style={{
                              fontSize: "11px", fontWeight: 500, color: "#c9d1d9",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                            title={att.fileName}
                          >
                            {att.fileName}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "3px" }}>
                            <span style={{ fontSize: "10px", color: "#6e7681" }}>
                              {formatFileSize(att.fileSize)}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteAttachment(att.id); }}
                              title="Delete"
                              style={{
                                background: "transparent", border: "none",
                                color: "#484f58", fontSize: "12px", cursor: "pointer",
                                padding: "2px 4px", borderRadius: "3px",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = "#ffa198"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = "#484f58"; }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && <LightboxViewer attachment={lightbox} onClose={() => setLightbox(null)} />}

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
