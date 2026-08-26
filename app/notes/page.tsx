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
  const router = useRouter();

  // Check login state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/");
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [router]);

  // Watch notes in real-time
  useEffect(() => {
    if (!user) return;
    const unsub = watchNotes(user.uid, setNotes);
    return () => unsub();
  }, [user]);

  const activeNote = notes.find((n) => n.id === activeId);

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
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      : null;
    await updateNote(user.uid, activeNote.id, { shared: newShared, shareExpiresAt });
  }

  if (!user) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: "1px solid #ccc", padding: 16, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <strong>My Notes</strong>
          <button onClick={() => logOut()}>Log Out</button>
        </div>
        <button onClick={handleNewNote} style={{ width: "100%", padding: 8, marginBottom: 12 }}>
          + New Note
        </button>
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => setActiveId(note.id)}
            style={{
              padding: 8,
              marginBottom: 6,
              cursor: "pointer",
              background: note.id === activeId ? "#eee" : "transparent",
              borderRadius: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{note.title || "Untitled"}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(note.id);
              }}
              style={{ fontSize: 12 }}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, padding: 24 }}>
        {activeNote ? (
          <>
            <input
              value={activeNote.title}
              onChange={(e) => handleUpdate("title", e.target.value)}
              style={{ fontSize: 24, fontWeight: "bold", width: "100%", marginBottom: 12, border: "none", outline: "none" }}
            />
            <textarea
              value={activeNote.body}
              onChange={(e) => handleUpdate("body", e.target.value)}
              style={{ width: "100%", height: "60%", fontSize: 16, border: "1px solid #ddd", padding: 12 }}
            />
            <div style={{ marginTop: 16 }}>
              <button onClick={handleToggleShare}>
                {activeNote.shared ? "Stop Sharing" : "Share (24h link)"}
              </button>
              {activeNote.shared && (
                <p style={{ marginTop: 8, fontSize: 14 }}>
                  Share this link:{" "}
                  <code>
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/share/${user.uid}_${activeNote.id}`
                      : ""}
                  </code>
                </p>
              )}
            </div>
          </>
        ) : (
          <p>Select a note or create a new one.</p>
        )}
      </div>
    </div>
  );
}