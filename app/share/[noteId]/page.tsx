"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SharedNote() {
  const params = useParams();
  const combined = params.noteId as string;
  const [note, setNote] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNote() {
      try {
        const [uid, noteId] = combined.split("_");
        if (!uid || !noteId) {
          setError("Invalid share link (missing uid or noteId).");
          setLoading(false);
          return;
        }
        const ref = doc(db, `users/${uid}/notes/${noteId}`);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Note not found in database.");
        } else {
          const data = snap.data();
          const expired =
            !data.shared ||
            (data.shareExpiresAt && data.shareExpiresAt.toDate() < new Date());
          if (expired) {
            setError("This share link has expired or is no longer active.");
          } else {
            setNote(data);
          }
        }
      } catch (err: any) {
        console.error("Share page error:", err);
        setError(`Error: ${err.message || "unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [combined]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error) return <p style={{ padding: 24, color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>{note.title}</h1>
      <p style={{ whiteSpace: "pre-wrap", fontSize: 16 }}>{note.body}</p>
      <p style={{ marginTop: 24, fontSize: 12, color: "#888" }}>
        This is a shared, read-only view.
      </p>
    </div>
  );
}
