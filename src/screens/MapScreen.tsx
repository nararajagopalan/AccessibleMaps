import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "../config/env";
import { logOut } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { getDoc, doc } from "firebase/firestore";
import { FirestorePlace } from "../types";
import { db } from "../config/firebase";

import { Place } from "../types";
import SearchBar from "../components/SearchBar";
import PlaceCard from "../components/PlaceCard";

const { height } = Dimensions.get("window");

export default function MapScreen() {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  const handleSearch = async (query: string) => {
    setLastSearchQuery(query);
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

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
        <Ionicons name="log-out-outline" size={24} color="#666" />
      </TouchableOpacity>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={[
          styles.map,
          isSearchActive && places.length > 0 && styles.halfMap,
        ]}
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : undefined
        }
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
        )}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.location}
            title={place.name}
          />
        ))}
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
  },
  map: {
    flex: 1,
  },
  halfMap: {
    height: height * 0.5,
  },
  placesList: {
    flex: 1,
    backgroundColor: "white",
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
