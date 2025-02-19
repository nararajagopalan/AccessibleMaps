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
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../App";
import { AccessibilityReview, FirestorePlace } from "../types";
import { db } from "../config/firebase";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";

type PlaceScreenRouteProp = RouteProp<RootStackParamList, "Place">;
type PlaceScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function PlaceScreen() {
  const route = useRoute<PlaceScreenRouteProp>();
  const navigation = useNavigation<PlaceScreenNavigationProp>();
  const [reviews, setReviews] = useState<AccessibilityReview[]>([]);
  const [placeData, setPlaceData] = useState<FirestorePlace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const placeDoc = await getDoc(doc(db, "places", route.params.placeId));
        setPlaceData(placeDoc.data() as FirestorePlace);

        const reviewsRef = collection(
          db,
          `places/${route.params.placeId}/accessibilityReviews`
        );
        const reviewsSnapshot = await getDocs(reviewsRef);
        const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AccessibilityReview[];

        setReviews(
          fetchedReviews.sort(
            (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
          )
        );
      } catch (error) {
        console.error("Error fetching place data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceData();
  }, [route.params.placeId]);

  const renderRatingStars = (rating: number) => (
    <View style={styles.stars}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={24}
          color="#4CAF50"
        />
      ))}
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
      <Text style={styles.placeName}>{route.params.placeName}</Text>

      <View style={styles.ratingsOverview}>
        <View style={styles.ratingCategory}>
          <Text style={styles.ratingLabel}>Physical</Text>
          {renderRatingStars(placeData?.aggregatePhysicalRating || 0)}
        </View>

        <View style={styles.ratingCategory}>
          <Text style={styles.ratingLabel}>Sensory</Text>
          {renderRatingStars(placeData?.aggregateSensoryRating || 0)}
        </View>

        <View style={styles.ratingCategory}>
          <Text style={styles.ratingLabel}>Cognitive</Text>
          {renderRatingStars(placeData?.aggregateCognitiveRating || 0)}
        </View>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reviews yet</Text>
            <Text style={styles.emptySubText}>
              Be the first to add a review!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.ratingsContainer}>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Physical:</Text>
                <View style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.physicalRating ? "star" : "star-outline"}
                      size={16}
                      color="#4CAF50"
                    />
                  ))}
                </View>
              </View>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Sensory:</Text>
                <View style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.sensoryRating ? "star" : "star-outline"}
                      size={16}
                      color="#4CAF50"
                    />
                  ))}
                </View>
              </View>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Cognitive:</Text>
                <View style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.cognitiveRating ? "star" : "star-outline"}
                      size={16}
                      color="#4CAF50"
                    />
                  ))}
                </View>
              </View>
            </View>
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
          })
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
  placeName: {
    fontSize: 24,
    fontWeight: "600",
    padding: 16,
    backgroundColor: "white",
  },
  ratingsOverview: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
  },
  ratingCategory: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    minWidth: 80,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
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
  ratingsContainer: {
    marginBottom: 15,
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
});
