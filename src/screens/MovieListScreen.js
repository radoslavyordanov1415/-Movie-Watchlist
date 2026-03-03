import React, { useCallback, useState, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Modal,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useMovies } from "../hooks/useMovies";
import { updateMovie } from "../services/movieService";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "watched", label: "Watched" },
  { key: "unwatched", label: "To Watch" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "↓ Newest" },
  { key: "oldest", label: "↑ Oldest" },
  { key: "rating", label: "★ Top Rated" },
  { key: "az", label: "A–Z" },
];

export default function MovieListScreen({ navigation }) {
  const { user } = useAuth();
  const { movies, loading, error, refresh, silentRefresh } = useMovies(
    user?.uid,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeGenre, setActiveGenre] = useState("all");
  const [activeSort, setActiveSort] = useState("newest");
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      silentRefresh();
    }, [silentRefresh]),
  );

  const uniqueGenres = useMemo(() => {
    const genres = movies.map((m) => m.genre).filter(Boolean);
    return ["all", ...Array.from(new Set(genres)).sort()];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    let result = movies;

    if (activeFilter === "watched") {
      result = result.filter((m) => m.watched === true);
    } else if (activeFilter === "unwatched") {
      result = result.filter((m) => m.watched !== true);
    }

    if (activeGenre !== "all") {
      result = result.filter((m) => m.genre === activeGenre);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      if (activeSort === "oldest") {
        return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
      }
      if (activeSort === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      if (activeSort === "az") {
        return a.title.localeCompare(b.title);
      }
      return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
    });

    return result;
  }, [movies, activeFilter, activeGenre, activeSort, searchQuery]);

  const handleToggleWatched = useCallback(
    async (movie) => {
      await updateMovie(movie.id, {
        watched: !movie.watched,
        existingImageUrl: movie.imageUrl,
      });
      silentRefresh();
    },
    [silentRefresh],
  );

  const cycleSortKey = useCallback(() => {
    const keys = SORT_OPTIONS.map((s) => s.key);
    const next = (keys.indexOf(activeSort) + 1) % keys.length;
    setActiveSort(keys[next]);
  }, [activeSort]);

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
      <MovieCard
        movie={item}
        onPress={() => handleMoviePress(item)}
        onToggleWatched={() => handleToggleWatched(item)}
      />
    ),
    [handleMoviePress, handleToggleWatched],
  );

  const renderEmpty = () => {
    if (loading) return null;
    const isFiltered =
      searchQuery.trim() || activeFilter !== "all" || activeGenre !== "all";
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
          {STATUS_FILTERS.map((f) => (
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
          {uniqueGenres.length > 2 && (
            <TouchableOpacity
              style={[
                styles.genreDropdownBtn,
                activeGenre !== "all" && styles.genreDropdownBtnActive,
              ]}
              onPress={() => setGenreDropdownOpen(true)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.genreDropdownBtnText,
                  activeGenre !== "all" && styles.genreDropdownBtnTextActive,
                ]}
                numberOfLines={1}
              >
                {activeGenre === "all" ? "Genre ▾" : `${activeGenre} ▾`}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={cycleSortKey}
            activeOpacity={0.75}
          >
            <Text style={styles.sortBtnText}>
              {SORT_OPTIONS.find((s) => s.key === activeSort)?.label}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={genreDropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setGenreDropdownOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setGenreDropdownOpen(false)}>
            <View style={styles.dropdownOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.dropdownMenu}>
                  <Text style={styles.dropdownTitle}>Filter by Genre</Text>
                  <ScrollView bounces={false}>
                    {uniqueGenres.map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.dropdownItem,
                          activeGenre === g && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setActiveGenre(g);
                          setGenreDropdownOpen(false);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            activeGenre === g && styles.dropdownItemTextActive,
                          ]}
                        >
                          {g === "all" ? "All Genres" : g}
                        </Text>
                        {activeGenre === g && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#E50914"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {loading && movies.length === 0 && <LoadingSpinner />}

        {error && !loading && (
          <ErrorMessage message={error} onRetry={refresh} />
        )}

        {!error && (
          <FlatList
            data={filteredMovies}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={
              filteredMovies.length === 0 ? styles.flex : styles.list
            }
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
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
    </TouchableWithoutFeedback>
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
    paddingHorizontal: 10,
    gap: 5,
    marginBottom: 4,
    alignItems: "center",
    flexWrap: "nowrap",
  },
  sortBtn: {
    marginLeft: "auto",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#555",
  },
  sortBtnText: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "600",
  },
  genreDropdownBtn: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    maxWidth: 95,
  },
  genreDropdownBtnActive: {
    backgroundColor: "#1a3a5c",
    borderColor: "#2a6aac",
  },
  genreDropdownBtnText: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
  },
  genreDropdownBtnTextActive: {
    color: "#6ab0f5",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    width: 240,
    maxHeight: 360,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  dropdownTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  dropdownItemActive: {
    backgroundColor: "#141414",
  },
  dropdownItemText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownItemTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    fontSize: 11,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  genreChip: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    alignSelf: "flex-start",
  },
  genreChipText: {
    color: "#888",
    fontSize: 10,
    fontWeight: "600",
  },
  genreChipActive: {
    backgroundColor: "#1a3a5c",
    borderColor: "#2a6aac",
  },
  genreChipTextActive: {
    color: "#6ab0f5",
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
