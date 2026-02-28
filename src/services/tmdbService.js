import {
  TMDB_READ_TOKEN,
  TMDB_BASE_URL,
  TMDB_IMAGE_W342,
  TMDB_IMAGE_W780,
} from "../config/tmdb";

const TMDB_GENRE_MAP = {
  28: "Action",
  12: "Action",
  16: "Animation",
  35: "Comedy",
  80: "Drama",
  99: "Documentary",
  18: "Drama",
  10751: "Drama",
  14: "Drama",
  36: "Drama",
  27: "Horror",
  10402: "Drama",
  9648: "Thriller",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "Drama",
  53: "Thriller",
  10752: "Action",
  37: "Action",
};

function mapTmdbGenre(genreIds = []) {
  for (const id of genreIds) {
    if (TMDB_GENRE_MAP[id]) return TMDB_GENRE_MAP[id];
  }
  return "Other";
}

const headers = {
  Authorization: `Bearer ${TMDB_READ_TOKEN}`,
  "Content-Type": "application/json",
};

export async function searchMovies(query, page = 1) {
  try {
    const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&language=en-US`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      data: json.results.map(normalizeTmdbMovie),
      totalPages: json.total_pages,
      page: json.page,
    };
  } catch (err) {
    console.error("searchMovies error:", err);
    return { error: "Failed to search movies. Check your connection." };
  }
}

export async function getTmdbMovieDetails(tmdbId) {
  try {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?language=en-US`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: normalizeTmdbMovieDetail(json) };
  } catch (err) {
    console.error("getTmdbMovieDetails error:", err);
    return { error: "Failed to load movie details." };
  }
}

export function getPosterUrl(path, large = false) {
  if (!path) return null;
  return `${large ? TMDB_IMAGE_W780 : TMDB_IMAGE_W342}${path}`;
}

function normalizeTmdbMovie(m) {
  return {
    tmdbId: m.id,
    title: m.title,
    year: m.release_date ? m.release_date.slice(0, 4) : "",
    posterPath: m.poster_path,
    posterUrl: getPosterUrl(m.poster_path),
    overview: m.overview,
    tmdbRating: m.vote_average,
    genreIds: m.genre_ids,
    genre: mapTmdbGenre(m.genre_ids),
  };
}

function normalizeTmdbMovieDetail(m) {
  return {
    tmdbId: m.id,
    title: m.title,
    year: m.release_date ? m.release_date.slice(0, 4) : "",
    posterPath: m.poster_path,
    posterUrl: getPosterUrl(m.poster_path, true),
    overview: m.overview,
    tmdbRating: m.vote_average,
    runtime: m.runtime,
    genres: m.genres?.map((g) => g.name) ?? [],
    genre: mapTmdbGenre(m.genres?.map((g) => g.id) ?? []),
  };
}
