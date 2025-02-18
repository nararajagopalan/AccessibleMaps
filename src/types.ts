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
  accessibilityRating: number;
  accessibilityReviewCount: number;
  photos: string[];
  phoneNumber?: string;
};

export type FirestorePlace = {
  aggregateAccessibilityRating: number;
  accessibilityReviewCount: number;
  reviews?: {
    userId: string;
    rating: number;
    comment: string;
    timestamp: Date;
    photos?: string[];
  }[];
};

export type AccessibilityReview = {
  id: string;
  userId: string;
  placeId: string;
  entryRating: number;
  restroomRating: number;
  seatingRating: number;
  reviewText: string;
  createdAt: {
    toDate: () => Date;
    toMillis: () => number;
  };
  photos?: string[];
};

export type GoogleReview = {
  id: string;
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  profile_photo_url?: string;
};
