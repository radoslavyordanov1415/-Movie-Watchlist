import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { movieSchema } from "../utils/validators";
import { updateMovie } from "../services/movieService";
import ImagePickerButton from "../components/ImagePickerButton";
import RatingPicker from "../components/RatingPicker";

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Animation",
  "Documentary",
  "Other",
];

export default function EditMovieScreen({ route, navigation }) {
  const { movie } = route.params;

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(movie.genre ?? "");
  const [showGenrePicker, setShowGenrePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: movie.title ?? "",
      genre: movie.genre ?? "",
      description: movie.description ?? "",
      rating: movie.rating ?? 3,
      watched: movie.watched ?? false,
      watchDate: movie.watchDate
        ? new Date(movie.watchDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await updateMovie(movie.id, {
      ...data,
      imageUri: selectedImage?.uri ?? null,
      existingImageUrl: movie.imageUrl ?? null,
    });
    setLoading(false);

    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      Alert.alert("Saved", `"${data.title}" has been updated.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setValue("genre", genre, { shouldValidate: true });
    setShowGenrePicker(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Text style={styles.heading}>Edit Movie</Text>

            <Text style={styles.label}>Poster Image</Text>
            {movie.imageUrl && !selectedImage && (
              <Image
                source={{ uri: movie.imageUrl }}
                style={styles.existingImage}
                resizeMode="cover"
              />
            )}
            <ImagePickerButton
              image={selectedImage}
              onImageSelected={setSelectedImage}
            />
            {selectedImage && (
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Text style={styles.removeImage}>Remove new photo</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>Title *</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="e.g. Inception"
                  placeholderTextColor="#555"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.title && (
              <Text style={styles.error}>{errors.title.message}</Text>
            )}

            <Text style={styles.label}>Genre *</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.pickerButton,
                errors.genre && styles.inputError,
              ]}
              onPress={() => setShowGenrePicker(!showGenrePicker)}
            >
              <Text
                style={
                  selectedGenre ? styles.pickerText : styles.pickerPlaceholder
                }
              >
                {selectedGenre || "Select a genre"}
              </Text>
              <Text style={styles.pickerArrow}>
                {showGenrePicker ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            {errors.genre && (
              <Text style={styles.error}>{errors.genre.message}</Text>
            )}
            {showGenrePicker && (
              <View style={styles.genreList}>
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genreItem,
                      selectedGenre === g && styles.genreItemSelected,
                    ]}
                    onPress={() => handleGenreSelect(g)}
                  >
                    <Text
                      style={[
                        styles.genreItemText,
                        selectedGenre === g && styles.genreItemTextSelected,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Synopsis / Notes *</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  placeholder="Write a short synopsis or your thoughts..."
                  placeholderTextColor="#555"
                  multiline
                  numberOfLines={4}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.description && (
              <Text style={styles.error}>{errors.description.message}</Text>
            )}

            <Text style={styles.label}>Your Rating</Text>
            <Controller
              control={control}
              name="rating"
              render={({ field: { onChange, value } }) => (
                <RatingPicker value={value} onChange={onChange} />
              )}
            />

            <Text style={styles.label}>Watch Date (YYYY-MM-DD)</Text>
            <Controller
              control={control}
              name="watchDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.watchDate && styles.inputError]}
                  placeholder="e.g. 2024-12-01"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.watchDate && (
              <Text style={styles.error}>{errors.watchDate.message}</Text>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.label}>Already Watched?</Text>
              <Controller
                control={control}
                name="watched"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: "#333", true: "#E50914" }}
                    thumbColor={value ? "#fff" : "#888"}
                  />
                )}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#141414" },
  flex: { flex: 1 },
  container: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 40 },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
  label: { color: "#ccc", marginBottom: 6, fontWeight: "600", marginTop: 16 },
  input: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    marginBottom: 4,
  },
  inputError: { borderColor: "#E50914" },
  error: { color: "#E50914", fontSize: 12, marginBottom: 8 },
  textArea: { height: 100, textAlignVertical: "top" },
  existingImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  removeImage: { color: "#E50914", fontSize: 13, marginBottom: 8 },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerText: { color: "#fff", fontSize: 15 },
  pickerPlaceholder: { color: "#555", fontSize: 15 },
  pickerArrow: { color: "#888", fontSize: 12 },
  genreList: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    marginBottom: 4,
    overflow: "hidden",
  },
  genreItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  genreItemSelected: { backgroundColor: "#2a0a0a" },
  genreItemText: { color: "#ccc", fontSize: 15 },
  genreItemTextSelected: { color: "#E50914", fontWeight: "bold" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#E50914",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
