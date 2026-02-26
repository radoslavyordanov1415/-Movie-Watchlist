import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MovieListScreen from "../screens/MovieListScreen";
import MovieDetailsScreen from "../screens/MovieDetailsScreen";
import EditMovieScreen from "../screens/EditMovieScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#141414" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: "#141414" },
      }}
    >
      <Stack.Screen
        name="MovieList"
        component={MovieListScreen}
        options={{ title: "🎬 My Watchlist" }}
      />

      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{ title: "Movie Details" }}
      />

      <Stack.Screen
        name="EditMovie"
        component={EditMovieScreen}
        options={{ title: "Edit Movie" }}
      />
    </Stack.Navigator>
  );
}
