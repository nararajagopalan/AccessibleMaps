import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  RouteProp,
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../App";
import { AccessibilityReview } from "../types";
import { db } from "../config/firebase";
import { Timestamp } from "firebase/firestore";
import { StackNavigationProp } from "@react-navigation/stack";

type AccessibilityReviewsRouteProp = RouteProp<
  RootStackParamList,
  "AccessibilityReviews"
>;

type AccessibilityReviewsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AccessibilityReviews"
>;

export default function AccessibilityReviewsScreen() {
  const route = useRoute<AccessibilityReviewsRouteProp>();
  const navigation = useNavigation<AccessibilityReviewsScreenNavigationProp>();
  const [reviews, setReviews] = useState<AccessibilityReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(
        db,
        `places/${route.params.placeId}/accessibilityReviews`
      );
      console.log("Fetching reviews for place:", route.params.placeId);
      const reviewsSnapshot = await getDocs(reviewsRef);
      console.log("Found reviews:", reviewsSnapshot.docs.length);

      const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AccessibilityReview[];
      console.log("Processed reviews:", fetchedReviews);

      setReviews(
        fetchedReviews.sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
        )
      );
    } catch (error) {
      console.error("Error fetching accessibility reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchReviews();
    }, [route.params.placeId])
  );

  const renderRatingSection = (review: AccessibilityReview) => (
    <View style={styles.ratingsContainer}>
      <View style={styles.ratingItem}>
        <Text style={styles.ratingLabel}>Entry:</Text>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.entryRating ? "star" : "star-outline"}
              size={16}
              color="#4CAF50"
            />
          ))}
        </View>
      </View>
      <View style={styles.ratingItem}>
        <Text style={styles.ratingLabel}>Restroom:</Text>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.restroomRating ? "star" : "star-outline"}
              size={16}
              color="#4CAF50"
            />
          ))}
        </View>
      </View>
      <View style={styles.ratingItem}>
        <Text style={styles.ratingLabel}>Seating:</Text>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.seatingRating ? "star" : "star-outline"}
              size={16}
              color="#4CAF50"
            />
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No accessibility reviews yet</Text>
            <Text style={styles.emptySubText}>
              Be the first to add a review!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            {renderRatingSection(item)}
            <Text style={styles.reviewText}>{item.reviewText}</Text>
            {item.photos && item.photos.length > 0 && (
              <ScrollView horizontal style={styles.photoList}>
                {item.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.reviewPhoto}
                  />
                ))}
              </ScrollView>
            )}
            <Text style={styles.reviewDate}>
              {item.createdAt.toDate().toLocaleDateString()}
            </Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate("AddAccessibilityReview", {
            placeId: route.params.placeId,
            placeName: route.params.placeName,
          } as const)
        }
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Review</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
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
  ratingsContainer: {
    marginBottom: 15,
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingLabel: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 10,
  },
  photoList: {
    marginVertical: 10,
  },
  reviewPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 5,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
