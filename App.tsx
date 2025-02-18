import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";

// Screens
import MapScreen from "./src/screens/MapScreen";
import GoogleReviewsScreen from "./src/screens/GoogleReviewsScreen";
import AccessibilityReviewsScreen from "./src/screens/AccessibilityReviewsScreen";
import AddAccessibilityReviewScreen from "./src/screens/AddAccessibilityReviewScreen";

// Types
export type RootStackParamList = {
  Map: undefined;
  GoogleReviews: { placeId: string; placeName: string };
  AccessibilityReviews: { placeId: string; placeName: string };
  AddAccessibilityReview: { placeId: string; placeName: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function MainNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GoogleReviews"
          component={GoogleReviewsScreen}
          options={({ route }) => ({
            title: `Reviews for ${route.params.placeName}`,
          })}
        />
        <Stack.Screen
          name="AccessibilityReviews"
          component={AccessibilityReviewsScreen}
          options={({ route }) => ({ title: "Accessibility Reviews" })}
        />
        <Stack.Screen
          name="AddAccessibilityReview"
          component={AddAccessibilityReviewScreen}
          options={{ title: "Add Review" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AuthNavigator>
          <MainNavigator />
        </AuthNavigator>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
