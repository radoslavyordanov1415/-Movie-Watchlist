import { useState, useEffect, useCallback } from "react";
import { getMovies } from "../services/movieService";

export function useMovies(userId) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const result = await getMovies(userId);
    if (result.error) {
      setError(result.error);
    } else {
      setMovies(result.data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const silentRefresh = useCallback(async () => {
    if (!userId) return;
    const result = await getMovies(userId);
    if (!result.error) {
      setMovies(result.data);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { movies, loading, error, refresh, silentRefresh };
}
