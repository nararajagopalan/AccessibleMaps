import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../../App";
import { addAccessibilityReview } from "../services/firebase";
import { auth, timestamp } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { FirestorePlace } from "../types";

type AddAccessibilityReviewRouteProp = RouteProp<
  RootStackParamList,
  "AddAccessibilityReview"
>;

export default function AddAccessibilityReviewScreen() {
  const route = useRoute<AddAccessibilityReviewRouteProp>();
  const navigation = useNavigation();
  const [physicalRating, setPhysicalRating] = useState(0);
  const [sensoryRating, setSensoryRating] = useState(0);
  const [cognitiveRating, setCognitiveRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [placeData, setPlaceData] = useState<FirestorePlace | null>(null);

  useEffect(() => {
    const fetchPlaceData = async () => {
      const placeDoc = await getDoc(doc(db, "places", route.params.placeId));
      setPlaceData((placeDoc.data() as FirestorePlace) || null);
    };
    fetchPlaceData();
  }, [route.params.placeId]);

  const handlePhotoUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const renderStarRating = (
    rating: number,
    setRating: (rating: number) => void
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color="#4CAF50"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert("Error", "You must be logged in to submit a review");
        return;
      }

      if (
        physicalRating === 0 ||
        sensoryRating === 0 ||
        cognitiveRating === 0
      ) {
        Alert.alert("Error", "Please rate all categories");
        return;
      }

      if (reviewText.trim().length < 10) {
        Alert.alert("Error", "Please write a detailed review");
        return;
      }

      console.log("Submitting review for:", {
        placeId: route.params.placeId,
        placeName: route.params.placeName,
      });

      const reviewData = {
        userId: auth.currentUser.uid,
        placeId: route.params.placeId,
        placeName: route.params.placeName,
        physicalRating,
        sensoryRating,
        cognitiveRating,
        overallRating: (physicalRating + sensoryRating + cognitiveRating) / 3,
        reviewText,
        createdAt: timestamp(),
        photos: photos,
      };

      await addAccessibilityReview(route.params.placeId, reviewData);

      const currentAggregateRating =
        placeData?.aggregateAccessibilityRating || 0;
      const currentReviewCount = placeData?.accessibilityReviewCount || 0;

      const newAggregateRating =
        (currentAggregateRating * currentReviewCount +
          (physicalRating + sensoryRating + cognitiveRating) / 3) /
        (currentReviewCount + 1);

      navigation.goBack();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ratingSection}>
        <Text style={styles.categoryTitle}>Physical Accessibility</Text>
        <Text style={styles.categoryDescription}>
          Rate accessibility for mobility, physical navigation, and facility use
        </Text>
        {renderStarRating(physicalRating, setPhysicalRating)}

        <Text style={styles.categoryTitle}>Sensory Accessibility</Text>
        <Text style={styles.categoryDescription}>
          Rate accessibility for visual, auditory, and sensory needs
        </Text>
        {renderStarRating(sensoryRating, setSensoryRating)}

        <Text style={styles.categoryTitle}>Cognitive Accessibility</Text>
        <Text style={styles.categoryDescription}>
          Rate accessibility for wayfinding, communication, and understanding
        </Text>
        {renderStarRating(cognitiveRating, setCognitiveRating)}
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>Write Your Review</Text>
        <TextInput
          style={styles.reviewInput}
          multiline
          numberOfLines={6}
          placeholder="Share your experience..."
          value={reviewText}
          onChangeText={setReviewText}
        />
      </View>

      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Add Photos</Text>
        <ScrollView horizontal style={styles.photoList}>
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photoPreview}
            />
          ))}
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handlePhotoUpload}
          >
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  ratingSection: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
  },
  reviewSection: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    height: 120,
    textAlignVertical: "top",
  },
  photoSection: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 20,
  },
  photoList: {
    flexDirection: "row",
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoText: {
    color: "#666",
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
