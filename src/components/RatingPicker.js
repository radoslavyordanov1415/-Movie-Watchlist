import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// RatingPicker — Interactive 5-star rating selector
// Satisfies the "non-standard input" requirement (not a plain TextInput).
// ─────────────────────────────────────────────────────────────────────────────

export default function RatingPicker({ value, onChange }) {
  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            activeOpacity={0.7}
          >
            <Text style={star <= value ? styles.starOn : styles.starOff}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>{value} / 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  starsRow: { flexDirection: "row", gap: 6 },
  starOn: { fontSize: 30, color: "#FFD700" },
  starOff: { fontSize: 30, color: "#444" },
  label: { color: "#888", fontSize: 14 },
});
