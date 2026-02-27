import React, { useCallback, useState, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useMovies } from "../hooks/useMovies";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "watched", label: "Watched" },
  { key: "unwatched", label: "To Watch" },
];

export default function MovieListScreen({ navigation }) {
  const { user } = useAuth();
  const { movies, loading, error, refresh, silentRefresh } = useMovies(
    user?.uid,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useFocusEffect(
    useCallback(() => {
      silentRefresh();
    }, [silentRefresh]),
  );

  const filteredMovies = useMemo(() => {
    let result = movies;

    if (activeFilter === "watched") {
      result = result.filter((m) => m.watched === true);
    } else if (activeFilter === "unwatched") {
      result = result.filter((m) => m.watched !== true);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }

    return result;
  }, [movies, activeFilter, searchQuery]);

  const handleMoviePress = useCallback(
    (movie) => {
      navigation.navigate("MovieDetails", {
        movieId: movie.id,
        title: movie.title,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <MovieCard movie={item} onPress={() => handleMoviePress(item)} />
    ),
    [handleMoviePress],
  );

  const renderEmpty = () => {
    if (loading) return null;
    const isFiltered = searchQuery.trim() || activeFilter !== "all";
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{isFiltered ? "🔍" : "🎬"}</Text>
        <Text style={styles.emptyTitle}>
          {isFiltered ? "No movies found" : "Your watchlist is empty"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isFiltered ? "Try a different search or filter." : `Tap the `}
          {!isFiltered && <Text style={styles.highlight}>Add Movie</Text>}
          {!isFiltered && " tab to add your first movie!"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="light" />

      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={18}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies…"
          placeholderTextColor="#555"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              activeFilter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && movies.length === 0 && <LoadingSpinner />}

      {error && !loading && <ErrorMessage message={error} onRetry={refresh} />}

      {!error && (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            filteredMovies.length === 0 ? styles.flex : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={loading && movies.length > 0}
              onRefresh={refresh}
              tintColor="#E50914"
              colors={["#E50914"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#141414" },
  flex: { flexGrow: 1 },
  list: { paddingHorizontal: 16, paddingVertical: 12 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
  },
  filterChipActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  filterChipText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  highlight: { color: "#E50914", fontWeight: "bold" },
});
