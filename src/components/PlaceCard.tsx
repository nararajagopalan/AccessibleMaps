import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

  return (
    <View style={styles.card}>
      {place.photos && place.photos.length > 0 && (
        <Image source={{ uri: place.photos[0] }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <View style={styles.ratingContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("GoogleReviews", {
                placeId: place.id,
                placeName: place.name,
              })
            }
          >
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>
                {place.googleRating.toFixed(1)} ({place.googleReviewCount})
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AccessibilityReviews", {
                placeId: place.id,
                placeName: place.name,
              })
            }
          >
            <View style={styles.ratingBox}>
              <Ionicons name="accessibility" size={16} color="#4CAF50" />
              <Text style={styles.rating}>
                {place.accessibilityRating.toFixed(1)} (
                {place.accessibilityReviewCount})
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.address}>{place.address}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="navigate" size={20} color="#2196F3" />
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>

          {place.phoneNumber && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call" size={20} color="#4CAF50" />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social" size={20} color="#9E9E9E" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
