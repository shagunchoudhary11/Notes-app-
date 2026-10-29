"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logOut } from "@/lib/auth";
import { createNote, updateNote, deleteNote, watchNotes } from "@/lib/notes";

export default function Notes() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const unsub = watchNotes(user.uid, setNotes);
    return () => unsub();
  }, [user]);

  const activeNote = notes.find((n) => n.id === activeId);

  const q = search.trim().toLowerCase();
  const visibleNotes = notes.filter((n) =>
    !q ||
    (n.title || "").toLowerCase().includes(q) ||
    (n.body || "").toLowerCase().includes(q) ||
    (n.tagsText || "").toLowerCase().includes(q)
  );

  async function handleNewNote() {
    if (!user) return;
    const ref = await createNote(user.uid);
    setActiveId(ref.id);
  }

  async function handleUpdate(field: string, value: any) {
    if (!user || !activeId) return;
    await updateNote(user.uid, activeId, { [field]: value });
  }

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteNote(user.uid, id);
    if (activeId === id) setActiveId(null);
  }

  async function handleToggleShare() {
    if (!user || !activeNote) return;
    const newShared = !activeNote.shared;
    const shareExpiresAt = newShared
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;
    await updateNote(user.uid, activeNote.id, { shared: newShared, shareExpiresAt });
  }

  const chips = (text?: string) =>
    (text || "").split(",").map((t) => t.trim()).filter(Boolean);

  if (!user) return <p className="nt-loading">Loading...</p>;

  return (
    <div className="nt-app">
      <aside className="nt-side">
        <div className="nt-head">
          <h2>My Notes</h2>
          <button className="nt-ghost" onClick={() => logOut()}>Log Out</button>
        </div>
        <button className="nt-new" onClick={handleNewNote}>+ New Note</button>
        <input
          className="nt-search"
          placeholder="Search notes or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="nt-list">
          {visibleNotes.map((note) => (
            <div
              key={note.id}
              className={"nt-item" + (note.id === activeId ? " active" : "")}
              onClick={() => setActiveId(note.id)}
            >
              <div className="nt-item-top">
                <span className="nt-item-title">{note.title || "Untitled"}</span>
                <button
                  className="nt-del"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                >
                  🗑
                </button>
              </div>
              <div className="nt-chips">
                {chips(note.tagsText).map((t) => (
                  <span key={t} className="nt-chip">{t}</span>
                ))}
              </div>
            </div>
          ))}
          {visibleNotes.length === 0 && <p className="nt-empty">No notes found</p>}
        </div>
      </aside>

      <main className="nt-main">
        {activeNote ? (
          <div className="nt-card">
            <input
              className="nt-title"
              placeholder="Title"
              value={activeNote.title ?? ""}
              onChange={(e) => handleUpdate("title", e.target.value)}
            />
            <input
              className="nt-tags"
              placeholder="Tags (comma separated)"
              value={activeNote.tagsText ?? ""}
              onChange={(e) => handleUpdate("tagsText", e.target.value)}
            />
            <textarea
              className="nt-body"
              placeholder="Write your note..."
              value={activeNote.body ?? ""}
              onChange={(e) => handleUpdate("body", e.target.value)}
            />
            <div className="nt-share">
              <button className="nt-new" onClick={handleToggleShare}>
                {activeNote.shared ? "Stop Sharing" : "Share (24h link)"}
              </button>
              {activeNote.shared && (
                <p>
                  Share this link:{" "}
                  <code>
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/share/${user.uid}_${activeNote.id}`
                      : ""}
                  </code>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="nt-placeholder">Select a note or create a new one.</p>
        )}
      </main>
    </div>
  );
}