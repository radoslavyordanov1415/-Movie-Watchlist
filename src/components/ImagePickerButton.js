import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// ─────────────────────────────────────────────────────────────────────────────
// ImagePickerButton
// Tapping opens the device image library. The selected image is passed up
// via onImageSelected({ uri }). Shows a preview once an image is picked.
// ─────────────────────────────────────────────────────────────────────────────

export default function ImagePickerButton({ image, onImageSelected }) {
  const handlePick = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload a poster.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 3], // portrait aspect ratio for a movie poster
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      onImageSelected(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.previewWrapper}>
          <Image
            source={{ uri: image.uri }}
            style={styles.preview}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.changeBtn} onPress={handlePick}>
            <Text style={styles.changeBtnText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.pickBtn} onPress={handlePick}>
          <Text style={styles.pickIcon}>📷</Text>
          <Text style={styles.pickText}>Choose Poster from Library</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    borderStyle: "dashed",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  pickIcon: { fontSize: 22 },
  pickText: { color: "#888", fontSize: 14 },
  previewWrapper: { alignItems: "center" },
  preview: { width: 140, height: 210, borderRadius: 10, marginBottom: 8 },
  changeBtn: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeBtnText: { color: "#ccc", fontSize: 13 },
});
