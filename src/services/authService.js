import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Auth Service
// Wraps Firebase Auth calls and returns { data, error } objects
// so callers never need to handle raw Firebase errors.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * Returns { data: UserCredential } on success or { error: string } on failure.
 */
export async function registerUser(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { data: credential };
  } catch (err) {
    return { error: mapAuthError(err.code) };
  }
}

/**
 * Sign in an existing user with email + password.
 */
export async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { data: credential };
  } catch (err) {
    return { error: mapAuthError(err.code) };
  }
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

// Map Firebase error codes to user-friendly messages
function mapAuthError(code) {
  const map = {
    "auth/email-already-in-use":
      "This email is already registered. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] ?? "An unexpected error occurred. Please try again.";
}
