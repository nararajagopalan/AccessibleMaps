import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { GoogleReview } from "../types";
import { GOOGLE_MAPS_API_KEY } from "../config/env";
import { Ionicons } from "@expo/vector-icons";

type GoogleReviewsRouteProp = RouteProp<RootStackParamList, "GoogleReviews">;

export default function GoogleReviewsScreen() {
  const route = useRoute<GoogleReviewsRouteProp>();
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${route.params.placeId}&fields=reviews&reviews_sort=newest&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.result && data.result.reviews) {
          const formattedReviews: GoogleReview[] = data.result.reviews.map(
            (review: any) => ({
              id: review.time.toString(),
              authorName: review.author_name,
              rating: review.rating,
              text: review.text,
              time: new Date(review.time * 1000),
              profilePhotoUrl: review.profile_photo_url,
            })
          );
          setReviews(formattedReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [route.params.placeId]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Text
        key={index}
        style={[styles.star, { color: index < rating ? "#FFD700" : "#CCCCCC" }]}
      >
        ★
      </Text>
    ));
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      route.params.placeName
    )}&query_place_id=${route.params.placeId}`;
    Linking.openURL(url).catch((err) =>
      console.error("Error opening Google Maps:", err)
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={reviews}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            Showing {reviews.length} most recent reviews
          </Text>
        </View>
      }
      ListFooterComponent={
        <TouchableOpacity
          style={styles.footerContainer}
          onPress={openInGoogleMaps}
        >
          <Text style={styles.footerText}>
            For more reviews, launch Google Maps
          </Text>
          <Ionicons
            name="open-outline"
            size={16}
            color="#4CAF50"
            style={styles.footerIcon}
          />
        </TouchableOpacity>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            {item.profile_photo_url && (
              <Image
                source={{ uri: item.profile_photo_url }}
                style={styles.profilePhoto}
              />
            )}
            <View>
              <Text style={styles.authorName}>{item.author_name}</Text>
              <Text style={styles.reviewTime}>
                {new Date(item.time * 1000).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < item.rating ? "star" : "star-outline"}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
          <Text style={styles.reviewText}>{item.text}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  reviewCard: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  reviewTime: {
    fontSize: 12,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  star: {
    fontSize: 18,
    marginRight: 2,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  headerContainer: {
    padding: 15,
    backgroundColor: "white",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  footerContainer: {
    padding: 15,
    backgroundColor: "white",
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: "#4CAF50",
    textAlign: "center",
  },
  footerIcon: {
    marginLeft: 8,
  },
});
