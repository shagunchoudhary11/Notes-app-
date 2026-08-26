"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
          setError("Invalid share link.");
          setLoading(false);
          return;
        }

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}/notes/${noteId}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.fields) {
          setError("Note not found.");
          setLoading(false);
          return;
        }

        const fields = data.fields;
        const shared = fields.shared?.booleanValue === true;
        const shareExpiresAt = fields.shareExpiresAt?.timestampValue
          ? new Date(fields.shareExpiresAt.timestampValue)
          : null;

        const expired = !shared || (shareExpiresAt && shareExpiresAt < new Date());

        if (expired) {
          setError("This share link has expired or is no longer active.");
        } else {
          setNote({
            title: fields.title?.stringValue || "Untitled",
            body: fields.body?.stringValue || "",
          });
        }
      } catch (err: any) {
        setError("This note is not available or the link is invalid.");
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