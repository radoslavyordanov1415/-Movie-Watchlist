import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { uploadImage, deleteImage } from "./storageService";

const COLLECTION = "movies";

export async function getMovies(userId) {
  try {
    const q = query(collection(db, COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const movies = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { data: movies };
  } catch (err) {
    console.error("getMovies error:", err);
    return { error: "Failed to load movies. Please try again." };
  }
}

export async function getMovieById(movieId) {
  try {
    const docRef = doc(db, COLLECTION, movieId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return { error: "Movie not found." };
    }
    return { data: { id: snapshot.id, ...snapshot.data() } };
  } catch (err) {
    console.error("getMovieById error:", err);
    return { error: "Failed to load movie details." };
  }
}

export async function addMovie({
  imageUri,
  imageUrl: providedImageUrl = null,
  ...movieData
}) {
  try {
    let imageUrl = providedImageUrl;

    if (imageUri) {
      const uploadResult = await uploadImage(
        imageUri,
        `posters/${movieData.userId}_${Date.now()}.jpg`,
      );
      if (!uploadResult.error) {
        imageUrl = uploadResult.url;
      } else {
        console.warn("Image upload failed, saving movie without poster.");
      }
    }

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...movieData,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { data: { id: docRef.id } };
  } catch (err) {
    console.error("addMovie error:", err);
    return { error: "Failed to add movie. Please try again." };
  }
}

export async function updateMovie(
  movieId,
  { imageUri, existingImageUrl, ...updates },
) {
  try {
    let imageUrl = existingImageUrl; // keep existing URL by default

    if (imageUri) {
      const uploadResult = await uploadImage(
        imageUri,
        `posters/${movieId}_${Date.now()}.jpg`,
      );
      if (uploadResult.error) return { error: uploadResult.error };
      imageUrl = uploadResult.url;

      if (existingImageUrl) {
        await deleteImage(existingImageUrl);
      }
    }

    const docRef = doc(db, COLLECTION, movieId);
    await updateDoc(docRef, {
      ...updates,
      imageUrl,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error("updateMovie error:", err);
    return { error: "Failed to update movie. Please try again." };
  }
}

export async function deleteMovie(movieId, imageUrl) {
  try {
    await deleteDoc(doc(db, COLLECTION, movieId));

    if (imageUrl) {
      await deleteImage(imageUrl);
    }

    return { success: true };
  } catch (err) {
    console.error("deleteMovie error:", err);
    return { error: "Failed to delete movie. Please try again." };
  }
}

export async function getMovieStats(userId) {
  try {
    const q = query(collection(db, COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const total = snapshot.size;
    const watched = snapshot.docs.filter(
      (d) => d.data().watched === true,
    ).length;
    return { data: { total, watched } };
  } catch (err) {
    console.error("getMovieStats error:", err);
    return { data: { total: 0, watched: 0 } };
  }
}
