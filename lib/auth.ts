import { auth, provider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Sign up with email/password
export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Log in with email/password
export async function logIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Log in with Google
export async function logInWithGoogle() {
  return signInWithPopup(auth, provider);
}

// Log out
export async function logOut() {
  return signOut(auth);
}