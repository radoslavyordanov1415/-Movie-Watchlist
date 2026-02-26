import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Storage Service — Firebase Storage image upload / delete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload an image from a local URI to Firebase Storage.
 * Works with both file:// and content:// URIs (via fetch → blob).
 *
 * @param {string} uri   - Local image URI returned by expo-image-picker
 * @param {string} path  - Storage path, e.g. "posters/user123_1700000000.jpg"
 * @returns {{ url: string } | { error: string }}
 */
export async function uploadImage(uri, path) {
  try {
    // Convert the URI to a Blob so the Firebase JS SDK can upload it
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Wait for the upload to complete
    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null, // progress callback (omitted for simplicity)
        (error) => reject(error),
        () => resolve(),
      );
    });

    const url = await getDownloadURL(storageRef);
    return { url };
  } catch (err) {
    console.error("uploadImage error:", err);
    return { error: "Failed to upload image. Please try again." };
  }
}

/**
 * Delete an image from Firebase Storage by its full download URL.
 * Fails silently if the file doesn't exist (e.g. already deleted).
 */
export async function deleteImage(downloadUrl) {
  try {
    const storageRef = ref(storage, downloadUrl);
    await deleteObject(storageRef);
  } catch (err) {
    // Ignore "object not found" — may have been deleted manually
    if (err.code !== "storage/object-not-found") {
      console.warn("deleteImage warning:", err.message);
    }
  }
}
