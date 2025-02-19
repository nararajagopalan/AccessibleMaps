import { Timestamp } from "firebase/firestore";

export interface FirestorePlace {
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: Date;
  aggregatePhysicalRating: number;
  aggregateSensoryRating: number;
  aggregateCognitiveRating: number;
  accessibilityReviewCount: number;
}

export interface AccessibilityReview {
  id: string;
  userId: string;
  placeId: string;
  placeName: string;
  physicalRating: number;
  sensoryRating: number;
  cognitiveRating: number;
  reviewText: string;
  photos: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  email: string;
  displayName: string;
  createdAt: Date;
  reviews: string[]; // Array of review IDs
}
