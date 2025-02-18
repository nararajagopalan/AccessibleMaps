import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "../config";
import { logOut } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { getDoc, doc } from "firebase/firestore";
import { FirestorePlace } from "../types";
import { db } from "../config/firebase";

import { Place } from "../types";
import SearchBar from "../components/SearchBar";
import PlaceCard from "../components/PlaceCard";

const { height } = Dimensions.get("window");

type MarkerCoordinate = {
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);

  console.log("Google Maps API Key:", GOOGLE_MAPS_API_KEY);
  console.log("Platform:", Platform.OS);

  useEffect(() => {
    (async () => {
      console.log("Requesting location permissions...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      console.log("Getting current position...");
      const location = await Location.getCurrentPositionAsync({});
      console.log("Got location:", location);
      setUserLocation(location);
    })();
  }, []);

  const handleSearch = async (query: string) => {
    setLastSearchQuery(query);
    console.log("Searching for:", query);
    try {
      if (!userLocation) return;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          query
        )}&location=${userLocation.coords.latitude},${
          userLocation.coords.longitude
        }&radius=5000&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      console.log("Search results:", data.results?.length || 0);

      if (data.results) {
        const searchResults = await Promise.all(
          data.results.map(async (result: any) => {
            // Get accessibility data from Firestore
            const placeDoc = await getDoc(doc(db, "places", result.place_id));
            console.log("Checking place:", {
              id: result.place_id,
              name: result.name,
              exists: placeDoc.exists(),
              data: placeDoc.data(),
            });
            const placeData = placeDoc.data() as FirestorePlace | undefined;

            return {
              id: result.place_id,
              name: result.name,
              location: {
                latitude: result.geometry.location.lat,
                longitude: result.geometry.location.lng,
              },
              address: result.formatted_address,
              googleRating: result.rating || 0,
              googleReviewCount: result.user_ratings_total || 0,
              accessibilityRating: placeData?.aggregateAccessibilityRating || 0,
              accessibilityReviewCount:
                placeData?.accessibilityReviewCount || 0,
              photos: result.photos
                ? [
                    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${result.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`,
                  ]
                : [],
              phoneNumber: result.formatted_phone_number,
            };
          })
        );

        setPlaces(searchResults);
        setIsSearchActive(true);
      }
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  const refreshResults = async () => {
    if (lastSearchQuery) {
      await handleSearch(lastSearchQuery);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (lastSearchQuery) {
        handleSearch(lastSearchQuery);
      }
    }, [lastSearchQuery])
  );

  const getMapStyle = (isSearchActive: boolean, hasPlaces: boolean) => ({
    width: Dimensions.get("window").width,
    height:
      isSearchActive && hasPlaces
        ? Dimensions.get("window").height * 0.5
        : Dimensions.get("window").height,
    backgroundColor: "lightgray",
  });

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
        <Ionicons name="log-out-outline" size={24} color="#666" />
      </TouchableOpacity>
      <MapView
        style={getMapStyle(isSearchActive, places.length > 0)}
        region={{
          latitude: userLocation?.coords.latitude ?? 37.78825,
          longitude: userLocation?.coords.longitude ?? -122.4324,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {places.map((place) => {
          const coordinate: MarkerCoordinate = {
            latitude: place.location.latitude,
            longitude: place.location.longitude,
          };
          return (
            <Marker
              key={place.id}
              coordinate={coordinate}
              title={place.name}
              pinColor="red"
            />
          );
        })}
      </MapView>
      {isSearchActive && places.length > 0 && (
        <FlatList
          style={styles.placesList}
          data={places}
          renderItem={({ item }) => <PlaceCard place={item} />}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  placesList: {
    height: Dimensions.get("window").height * 0.5,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  logoutButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 15,
    zIndex: 1,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
