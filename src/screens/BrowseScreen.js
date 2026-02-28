import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { searchMovies } from "../services/tmdbService";

export default function BrowseScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setError("");
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      const result = await searchMovies(query.trim());
      setLoading(false);
      setSearched(true);
      if (result.error) {
        setError(result.error);
      } else {
        setResults(result.data);
      }
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const handleMoviePress = useCallback(
    (movie) => {
      navigation.navigate("BrowseMovieDetails", { movie });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleMoviePress(item)}
        activeOpacity={0.75}
      >
        {item.posterUrl ? (
          <Image
            source={{ uri: item.posterUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterEmoji}>🎬</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.year ? <Text style={styles.year}>{item.year}</Text> : null}
          <Text style={styles.genre}>{item.genre}</Text>
          {item.tmdbRating > 0 && (
            <Text style={styles.rating}>
              ⭐ {item.tmdbRating.toFixed(1)} / 10
            </Text>
          )}
          <Text style={styles.overview} numberOfLines={3}>
            {item.overview || "No description available."}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleMoviePress],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      <Text style={styles.heading}>Browse Movies</Text>

      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={18}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search any movie…"
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoFocus={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color="#E50914" size="large" />
        </View>
      )}

      {!loading && error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.tmdbId)}
          renderItem={renderItem}
          contentContainerStyle={
            results.length === 0 ? styles.flex : styles.list
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            searched ? (
              <View style={styles.centered}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.emptyEmoji}>🎬</Text>
                <Text style={styles.emptyText}>
                  Search for a movie to add it to your watchlist
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#141414" },
  flex: { flexGrow: 1 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 0,
  },
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: { color: "#E50914", fontSize: 15, textAlign: "center" },
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
  poster: { width: 80, height: 120 },
  posterPlaceholder: {
    width: 80,
    height: 120,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  posterEmoji: { fontSize: 28 },
  info: { flex: 1, padding: 10, justifyContent: "flex-start", gap: 3 },
  title: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  year: { color: "#555", fontSize: 12 },
  genre: { color: "#888", fontSize: 12 },
  rating: { color: "#FFD700", fontSize: 12 },
  overview: { color: "#aaa", fontSize: 12, lineHeight: 17, marginTop: 2 },
});
