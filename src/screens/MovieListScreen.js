import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../contexts/AuthContext";
import { useMovies } from "../hooks/useMovies";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function MovieListScreen({ navigation }) {
  const { user } = useAuth();
  const { movies, loading, error, refresh, silentRefresh } = useMovies(user?.uid);

  useFocusEffect(
    useCallback(() => {
      silentRefresh();
    }, [silentRefresh])
  );

  const handleMoviePress = useCallback(
    (movie) => {
      navigation.navigate("MovieDetails", { movieId: movie.id, title: movie.title });
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
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎬</Text>
        <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Tap the <Text style={styles.highlight}>Add Movie</Text> tab to add
          your first movie!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="light" />

      {loading && movies.length === 0 && <LoadingSpinner />}

      {error && !loading && <ErrorMessage message={error} onRetry={refresh} />}

      {!error && (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            movies.length === 0 ? styles.flex : styles.list
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
