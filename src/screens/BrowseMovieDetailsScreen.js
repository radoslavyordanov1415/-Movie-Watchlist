import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getTmdbMovieDetails, getPosterUrl } from "../services/tmdbService";
import { addMovie } from "../services/movieService";
import { useAuth } from "../contexts/AuthContext";
import RatingPicker from "../components/RatingPicker";

export default function BrowseMovieDetailsScreen({ route, navigation }) {
  const { movie: previewMovie } = route.params;
  const { user } = useAuth();

  const [movie, setMovie] = useState(previewMovie);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [adding, setAdding] = useState(false);
  const [personalRating, setPersonalRating] = useState(3);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    getTmdbMovieDetails(previewMovie.tmdbId).then((result) => {
      if (!result.error) setMovie(result.data);
      setLoadingDetails(false);
    });
  }, [previewMovie.tmdbId]);

  const handleAdd = async () => {
    setAdding(true);
    const result = await addMovie({
      title: movie.title,
      genre: movie.genre,
      description: movie.overview || "",
      rating: personalRating,
      watched,
      watchDate: new Date().toISOString().split("T")[0],
      userId: user.uid,
      imageUrl: getPosterUrl(movie.posterPath, true),
    });
    setAdding(false);

    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      Alert.alert(
        "Added!",
        `"${movie.title}" has been added to your watchlist.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("BrowseSearch"),
          },
        ],
      );
    }
  };

  const posterUri =
    movie.posterUrl ||
    (movie.posterPath ? getPosterUrl(movie.posterPath, true) : null);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        {posterUri ? (
          <Image
            source={{ uri: posterUri }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterEmoji}>🎬</Text>
          </View>
        )}

        <View style={styles.badgeRow}>
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{movie.genre}</Text>
          </View>
          {movie.year ? (
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{movie.year}</Text>
            </View>
          ) : null}
          {movie.runtime ? (
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{movie.runtime} min</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title}>{movie.title}</Text>

        {movie.tmdbRating > 0 && (
          <Text style={styles.tmdbRating}>
            ⭐ TMDB: {movie.tmdbRating.toFixed(1)} / 10
          </Text>
        )}

        {movie.genres?.length > 0 && (
          <Text style={styles.genreList}>{movie.genres.join(" · ")}</Text>
        )}

        {movie.overview ? (
          <>
            <Text style={styles.sectionLabel}>Overview</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
          </>
        ) : null}

        {loadingDetails && (
          <ActivityIndicator color="#E50914" style={{ marginVertical: 8 }} />
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Add to Your Watchlist</Text>

        <Text style={styles.fieldLabel}>Your Personal Rating</Text>
        <RatingPicker value={personalRating} onChange={setPersonalRating} />

        <View style={styles.switchRow}>
          <Text style={styles.fieldLabel}>Already Watched?</Text>
          <Switch
            value={watched}
            onValueChange={setWatched}
            trackColor={{ false: "#333", true: "#E50914" }}
            thumbColor={watched ? "#fff" : "#888"}
          />
        </View>

        <TouchableOpacity
          style={[styles.addBtn, adding && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>＋ Add to Watchlist</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#141414" },
  container: { paddingBottom: 40 },
  poster: { width: "100%", height: 360 },
  posterPlaceholder: {
    width: "100%",
    height: 360,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  posterEmoji: { fontSize: 72 },
  badgeRow: { flexDirection: "row", padding: 16, gap: 8, flexWrap: "wrap" },
  genreBadge: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  genreText: { color: "#a0a0ff", fontSize: 13, fontWeight: "600" },
  yearBadge: {
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  yearText: { color: "#888", fontSize: 13, fontWeight: "600" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  tmdbRating: {
    color: "#FFD700",
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  genreList: {
    color: "#666",
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  overview: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  fieldLabel: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 6,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  addBtn: {
    backgroundColor: "#E50914",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
