import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// MovieCard — pressable list item for MovieListScreen's FlatList
// ─────────────────────────────────────────────────────────────────────────────

export default function MovieCard({ movie, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Poster */}
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

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.genre}>{movie.genre}</Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Text
              key={s}
              style={s <= (movie.rating ?? 0) ? styles.starOn : styles.starOff}
            >
              ★
            </Text>
          ))}
        </View>

        {/* Watched badge */}
        <View
          style={[
            styles.badge,
            movie.watched ? styles.badgeWatched : styles.badgeUnwatched,
          ]}
        >
          <Text style={styles.badgeText}>
            {movie.watched ? "✅ Watched" : "⏳ To Watch"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  poster: { width: 90, height: 130 },
  posterPlaceholder: {
    width: 90,
    height: 130,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  posterEmoji: { fontSize: 32 },
  info: { flex: 1, padding: 12, justifyContent: "space-between" },
  title: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  genre: { color: "#888", fontSize: 13, marginBottom: 6 },
  starsRow: { flexDirection: "row", marginBottom: 8 },
  starOn: { color: "#FFD700", fontSize: 14 },
  starOff: { color: "#444", fontSize: 14 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeWatched: { backgroundColor: "#0a3d0a" },
  badgeUnwatched: { backgroundColor: "#3d2a0a" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
