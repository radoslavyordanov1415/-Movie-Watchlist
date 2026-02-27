import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getMovieById, deleteMovie } from "../services/movieService";

function StarRating({ rating }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          style={star <= rating ? styles.starFilled : styles.starEmpty}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

export default function MovieDetailsScreen({ route, navigation }) {
  const { movieId } = route.params;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchMovie = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    const result = await getMovieById(movieId);
    if (result.error) {
      setError(result.error);
    } else {
      setMovie(result.data);
      navigation.setOptions({ title: result.data.title });
    }
    if (!silent) setLoading(false);
  }, [movieId, navigation]);

  useEffect(() => {
    fetchMovie(false);
  }, [fetchMovie]);

  useFocusEffect(
    useCallback(() => {
      if (movie) fetchMovie(true);
    }, [movie, fetchMovie])
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Movie",
      `Are you sure you want to remove "${movie?.title}" from your watchlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            const result = await deleteMovie(movieId, movie?.imageUrl);
            setDeleting(false);
            if (result.error) {
              Alert.alert("Error", result.error);
            } else {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate("EditMovie", { movie });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchMovie}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!movie) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        {movie.imageUrl ? (
          <Image
            source={{ uri: movie.imageUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterEmoji}>🎬</Text>
          </View>
        )}

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              movie.watched ? styles.badgeWatched : styles.badgeUnwatched,
            ]}
          >
            <Text style={styles.badgeText}>
              {movie.watched ? "✅ Watched" : "⏳ Not Watched"}
            </Text>
          </View>
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{movie.genre}</Text>
          </View>
        </View>

        <Text style={styles.title}>{movie.title}</Text>

        <StarRating rating={movie.rating ?? 0} />

        {movie.watchDate && (
          <Text style={styles.metaText}>
            📅 {new Date(movie.watchDate).toLocaleDateString()}
          </Text>
        )}

        {movie.description ? (
          <>
            <Text style={styles.sectionLabel}>Synopsis / Notes</Text>
            <Text style={styles.description}>{movie.description}</Text>
          </>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && styles.btnDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteBtnText}>🗑 Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#141414" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141414",
  },
  container: { paddingBottom: 40 },
  poster: { width: "100%", height: 320 },
  posterPlaceholder: {
    width: "100%",
    height: 320,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  posterEmoji: { fontSize: 72 },
  badgeRow: { flexDirection: "row", padding: 16, gap: 8, flexWrap: "wrap" },
  badge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  badgeWatched: { backgroundColor: "#0a3d0a" },
  badgeUnwatched: { backgroundColor: "#3d2a0a" },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  genreBadge: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  genreText: { color: "#a0a0ff", fontSize: 13, fontWeight: "600" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  starsRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8 },
  starFilled: { fontSize: 24, color: "#FFD700" },
  starEmpty: { fontSize: 24, color: "#444" },
  metaText: {
    color: "#888",
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  description: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#1a3a5c",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  editBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#5c1a1a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  btnDisabled: { opacity: 0.6 },
  errorText: { color: "#E50914", fontSize: 16, marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#E50914",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "bold" },
});
