import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../services/authService";
import { getMovieStats } from "../services/movieService";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, watched: 0 });
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      setLoadingStats(true);
      getMovieStats(user.uid).then((result) => {
        if (result.data) setStats(result.data);
        setLoadingStats(false);
      });
    }, [user]),
  );

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoadingLogout(true);
          await logoutUser();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </Text>
        </View>

        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.uid}>UID: {user?.uid?.slice(0, 12)}…</Text>

        <View style={styles.statsRow}>
          {loadingStats ? (
            <ActivityIndicator color="#E50914" />
          ) : (
            <>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Movies</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.watched}</Text>
                <Text style={styles.statLabel}>Watched</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {stats.total - stats.watched}
                </Text>
                <Text style={styles.statLabel}>Unwatched</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, loadingLogout && styles.btnDisabled]}
          onPress={handleLogout}
          disabled={loadingLogout}
        >
          {loadingLogout ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.logoutText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#141414" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  email: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 4 },
  uid: { color: "#555", fontSize: 12, marginBottom: 32 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 40,
  },
  statBox: { alignItems: "center", flex: 1 },
  statNumber: { color: "#E50914", fontSize: 28, fontWeight: "bold" },
  statLabel: { color: "#888", fontSize: 12, marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: "#333" },
  logoutBtn: {
    backgroundColor: "#2a0a0a",
    borderWidth: 1,
    borderColor: "#E50914",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  logoutText: { color: "#E50914", fontSize: 16, fontWeight: "bold" },
});
