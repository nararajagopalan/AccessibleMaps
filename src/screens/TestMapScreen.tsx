import React, { useState, useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "../config/env";

type MarkerCoordinate = {
  latitude: number;
  longitude: number;
};

type GooglePlace = {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

export default function TestMapScreen() {
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.7749295,
    longitude: -122.4194155,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  useEffect(() => {
    (async () => {
      console.log("Test: Requesting location permissions...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Test: Location permission status:", status);
      if (status !== "granted") {
        console.error("Test: Location permission denied");
        return;
      }

      console.log("Test: Getting current position...");
      const location = await Location.getCurrentPositionAsync({});
      console.log("Test: Got location:", location);
      setUserLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchNearbyPlaces();
      setMapRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [userLocation]);

  const searchNearbyPlaces = async () => {
    if (!userLocation) return;
    console.log("Searching for nearby places...");
    console.log(
      "Searching at:",
      userLocation.coords.latitude,
      userLocation.coords.longitude
    );
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.coords.latitude},${userLocation.coords.longitude}&radius=1000&type=restaurant&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    console.log("Found places:", data.results?.length || 0);
    console.log("First place:", data.results?.[0]);
    setPlaces(data.results || []);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{
            latitude: 37.7849295,
            longitude: -122.4174155,
          }}
          title="Test Marker"
          pinColor="purple"
        />
        {places.map((place) => {
          const coordinate: MarkerCoordinate = {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          };
          return (
            <Marker
              key={place.place_id}
              coordinate={coordinate}
              title={place.name}
              pinColor="red"
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
