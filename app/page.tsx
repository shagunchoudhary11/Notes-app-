"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signUp, logIn, logInWithGoogle } from "@/lib/auth";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/notes");
    });
    return () => unsub();
  }, [router]);

  async function handleSignUp() {
    setError("");
    setLoading(true);
    try {
      await signUp(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogIn() {
    setError("");
    setLoading(true);
    try {
      await logIn(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await logInWithGoogle();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>📝 Notes App</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", padding: 10, marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", width: "100%", padding: 10, marginBottom: 10 }}
      />

      {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

      <button onClick={handleLogIn} disabled={loading} style={{ width: "100%", padding: 10, marginBottom: 8 }}>
        Log In
      </button>
      <button onClick={handleSignUp} disabled={loading} style={{ width: "100%", padding: 10, marginBottom: 8 }}>
        Sign Up
      </button>
      <button onClick={handleGoogle} disabled={loading} style={{ width: "100%", padding: 10 }}>
        Continue with Google
      </button>
    </div>
  );
}