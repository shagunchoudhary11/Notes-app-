import { db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export async function createNote(uid: string) {
  return addDoc(collection(db, `users/${uid}/notes`), {
    title: "Untitled",
    body: "",
    tags: [],
    shared: false,
    shareExpiresAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNote(uid: string, id: string, data: any) {
  return updateDoc(doc(db, `users/${uid}/notes/${id}`), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(uid: string, id: string) {
  return deleteDoc(doc(db, `users/${uid}/notes/${id}`));
}

export function watchNotes(uid: string, cb: (docs: any[]) => void) {
  const q = query(collection(db, `users/${uid}/notes`), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
