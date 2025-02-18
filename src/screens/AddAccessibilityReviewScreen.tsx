import React, { useState } from "react";
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
import { auth } from "../config/firebase";

type AddAccessibilityReviewRouteProp = RouteProp<
  RootStackParamList,
  "AddAccessibilityReview"
>;

export default function AddAccessibilityReviewScreen() {
  const route = useRoute<AddAccessibilityReviewRouteProp>();
  const navigation = useNavigation();
  const [entryRating, setEntryRating] = useState(0);
  const [restroomRating, setRestroomRating] = useState(0);
  const [seatingRating, setSeatingRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

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
      if (entryRating === 0 || restroomRating === 0 || seatingRating === 0) {
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

      await addAccessibilityReview(route.params.placeId, {
        userId: auth.currentUser!.uid,
        placeId: route.params.placeId,
        placeName: route.params.placeName,
        entryRating,
        restroomRating,
        seatingRating,
        overallRating: (entryRating + restroomRating + seatingRating) / 3,
        reviewText,
        photos: [],
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ratingSection}>
        <Text style={styles.categoryTitle}>Entry & Navigation</Text>
        {renderStarRating(entryRating, setEntryRating)}

        <Text style={styles.categoryTitle}>Restrooms</Text>
        {renderStarRating(restroomRating, setRestroomRating)}

        <Text style={styles.categoryTitle}>Seating & Service</Text>
        {renderStarRating(seatingRating, setSeatingRating)}
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
