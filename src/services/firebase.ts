import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import {
  FirestorePlace,
  AccessibilityReview,
  UserProfile,
} from "../types/firebase";

// Auth functions
export const signUp = async (
  email: string,
  password: string,
  displayName: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Create user profile in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    displayName,
    createdAt: serverTimestamp(),
    reviews: [],
  });

  return userCredential.user;
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = () => signOut(auth);

// Firestore functions
export const addAccessibilityReview = async (
  placeId: string,
  review: Omit<AccessibilityReview, "id" | "createdAt" | "updatedAt">
) => {
  try {
    // First, create or update the place document
    const placeRef = doc(db, "places", placeId);
    const placeDoc = await getDoc(placeRef);

    // Create the review
    const reviewRef = doc(
      collection(db, `places/${placeId}/accessibilityReviews`)
    );
    await setDoc(reviewRef, {
      ...review,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update place aggregate ratings
    if (placeDoc.exists()) {
      const placeData = placeDoc.data() as FirestorePlace;
      const newCount = placeData.accessibilityReviewCount + 1;

      // Calculate new aggregate ratings
      const newPhysicalRating =
        (placeData.aggregatePhysicalRating *
          placeData.accessibilityReviewCount +
          review.physicalRating) /
        newCount;
      const newSensoryRating =
        (placeData.aggregateSensoryRating * placeData.accessibilityReviewCount +
          review.sensoryRating) /
        newCount;
      const newCognitiveRating =
        (placeData.aggregateCognitiveRating *
          placeData.accessibilityReviewCount +
          review.cognitiveRating) /
        newCount;

      await updateDoc(placeRef, {
        accessibilityReviewCount: newCount,
        aggregatePhysicalRating: newPhysicalRating,
        aggregateSensoryRating: newSensoryRating,
        aggregateCognitiveRating: newCognitiveRating,
        lastUpdated: serverTimestamp(),
      });
    } else {
      // First review for this place - create the place document
      await setDoc(placeRef, {
        accessibilityReviewCount: 1,
        aggregatePhysicalRating: review.physicalRating,
        aggregateSensoryRating: review.sensoryRating,
        aggregateCognitiveRating: review.cognitiveRating,
        lastUpdated: serverTimestamp(),
        name: review.placeName,
        placeId: placeId,
      });
    }

    console.log("Review added successfully:", reviewRef.id);
    return reviewRef.id;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

const updatePlaceAggregates = async (placeId: string) => {
  try {
    const reviewsRef = collection(db, `places/${placeId}/accessibilityReviews`);
    const reviewsSnapshot = await getDocs(reviewsRef);

    const reviews = reviewsSnapshot.docs.map(
      (doc) => doc.data() as AccessibilityReview
    );
    const count = reviews.length;

    // Calculate averages for each rating type
    const avgPhysicalRating =
      count > 0
        ? reviews.reduce((sum, review) => sum + review.physicalRating, 0) /
          count
        : 0;
    const avgSensoryRating =
      count > 0
        ? reviews.reduce((sum, review) => sum + review.sensoryRating, 0) / count
        : 0;
    const avgCognitiveRating =
      count > 0
        ? reviews.reduce((sum, review) => sum + review.cognitiveRating, 0) /
          count
        : 0;

    const placeRef = doc(db, "places", placeId);
    await setDoc(
      placeRef,
      {
        accessibilityReviewCount: count,
        aggregatePhysicalRating: avgPhysicalRating,
        aggregateSensoryRating: avgSensoryRating,
        aggregateCognitiveRating: avgCognitiveRating,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(
      `Updated aggregates for ${placeId}: count=${count}, physical=${avgPhysicalRating}, sensory=${avgSensoryRating}, cognitive=${avgCognitiveRating}`
    );
  } catch (error) {
    console.error("Error updating place aggregates:", error);
  }
};
