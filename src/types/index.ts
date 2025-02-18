export interface Place {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  googleRating: number;
  googleReviewCount: number;
  accessibilityRating: number;
  accessibilityReviewCount: number;
  photos: string[];
  address: string;
  phoneNumber?: string;
}

export interface GoogleReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  time: Date;
  profilePhotoUrl?: string;
}

export * from "./firebase";
