import { Timestamp } from "firebase/firestore";

export type Place = {
  id: string;
  place_id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  googleRating: number;
  googleReviewCount: number;
  physicalRating: number;
  sensoryRating: number;
  cognitiveRating: number;
  accessibilityReviewCount: number;
  photos: string[];
  phoneNumber?: string;
};

export type FirestorePlace = {
  aggregatePhysicalRating: number;
  aggregateSensoryRating: number;
  aggregateCognitiveRating: number;
  accessibilityReviewCount: number;
  reviews?: {
    userId: string;
    physicalRating: number;
    sensoryRating: number;
    cognitiveRating: number;
    reviewText: string;
    createdAt: Timestamp;
    photos?: string[];
  }[];
};

export interface AccessibilityReview {
  id: string;
  userId: string;
  placeId: string;
  placeName: string;
  physicalRating: number;
  sensoryRating: number;
  cognitiveRating: number;
  reviewText: string;
  createdAt: Timestamp;
  photos: string[];
}

export type GoogleReview = {
  id: string;
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  profile_photo_url?: string;
};
