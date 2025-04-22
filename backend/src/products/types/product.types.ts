export interface SerializedProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  rating: number;
  numReviews: number;
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    date: Date;
  }>;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
} 