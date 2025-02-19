import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { Place } from "../types";

// Add this type
type PlaceCardNavigationProp = StackNavigationProp<RootStackParamList>;

interface PlaceCardProps {
  place: Place;
  onReviewAdded?: () => Promise<void>;
}

export default function PlaceCard({ place, onReviewAdded }: PlaceCardProps) {
  const navigation = useNavigation<PlaceCardNavigationProp>();

  const openDirections = async () => {
    const destination = encodeURIComponent(place.address);
    const url = Platform.select({
      ios: `maps:?daddr=${destination}`,
      android: `google.navigation:q=${destination}`,
    });

    const canOpen = await Linking.canOpenURL(url!);
    if (canOpen) {
      await Linking.openURL(url!);
    } else {
      Alert.alert("Error", "Unable to open maps application");
    }
  };

  const openInGoogleMaps = async () => {
    const mapsUrl = Platform.select({
      ios: `comgooglemaps://?q=${encodeURIComponent(place.name)}&place_id=${
        place.place_id
      }`,
      android: `google.navigation:q=${encodeURIComponent(
        place.name
      )}&query_place_id=${place.place_id}`,
    });
    const webUrl = `https://www.google.com/maps/place/?q=${encodeURIComponent(
      place.name
    )}&query_place_id=${place.place_id}`;

    if (mapsUrl && (await Linking.canOpenURL(mapsUrl))) {
      await Linking.openURL(mapsUrl);
    } else {
      // Fall back to web browser if app isn't installed
      await Linking.openURL(webUrl);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Place", {
            placeId: place.id,
            placeName: place.name,
          })
        }
      >
        {place.photos && place.photos.length > 0 && (
          <Image source={{ uri: place.photos[0] }} style={styles.image} />
        )}

        <View style={styles.content}>
          <Text style={styles.name}>{place.name}</Text>
          <View style={styles.ratingContainer}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                openDirections();
              }}
            >
              <View style={styles.ratingBox}>
                <Ionicons name="navigate" size={16} color="#4CAF50" />
                <Text style={styles.rating}>Directions</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>
                {place.googleRating.toFixed(1)} ({place.googleReviewCount})
              </Text>
            </View>

            <View style={styles.accessibilityRatings}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Physical:</Text>
                <Text style={styles.rating}>
                  {place.physicalRating?.toFixed(1) || "N/A"}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Sensory:</Text>
                <Text style={styles.rating}>
                  {place.sensoryRating?.toFixed(1) || "N/A"}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Cognitive:</Text>
                <Text style={styles.rating}>
                  {place.cognitiveRating?.toFixed(1) || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.address}>{place.address}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 15,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: "#666",
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  directionsButton: {
    marginRight: 8,
    backgroundColor: "#E8F5E9",
  },
  directionsText: {
    color: "#4CAF50",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  accessibilityRatings: {
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#666",
    minWidth: 70,
  },
});
