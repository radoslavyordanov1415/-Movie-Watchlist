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
    // Use XMLHttpRequest to convert URI → Blob.
    // This is the correct approach for React Native — fetch().blob() does
    // not work reliably with Firebase Storage in the Expo environment.
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error('Failed to convert image to blob'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Wait for the upload to complete
    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => resolve(),
      );
    });

    // Release the blob memory
    blob.close?.();

    const url = await getDownloadURL(storageRef);
    return { url };
  } catch (err) {
    console.error('uploadImage error:', err);
    return { error: 'Failed to upload image. Please try again.' };
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
