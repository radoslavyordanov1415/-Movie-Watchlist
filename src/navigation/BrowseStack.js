import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BrowseScreen from "../screens/BrowseScreen";
import BrowseMovieDetailsScreen from "../screens/BrowseMovieDetailsScreen";

const Stack = createNativeStackNavigator();

export default function BrowseStack() {
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
        name="BrowseSearch"
        component={BrowseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BrowseMovieDetails"
        component={BrowseMovieDetailsScreen}
        options={({ route }) => ({
          title: route.params?.movie?.title ?? "Movie Details",
        })}
      />
    </Stack.Navigator>
  );
}
