import { Timestamp } from "firebase/firestore";

export interface FirestorePlace {
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: Date;
  aggregateAccessibilityRating: number;
  accessibilityReviewCount: number;
}

export interface AccessibilityReview {
  id: string;
  userId: string;
  placeId: string;
  placeName: string;
  entryRating: number;
  restroomRating: number;
  seatingRating: number;
  overallRating: number;
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
