import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  reviewId: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number; // 1-5
  comment: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    reviewId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true
    },
    userId: { 
      type: String, 
      required: true,
      index: true,
      ref: 'User'
    },
    productId: { 
      type: String, 
      required: true,
      index: true,
      ref: 'Product'
    },
    orderId: { 
      type: String,
      required: true,
      ref: 'Order'
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5,
      index: true
    },
    comment: { 
      type: String, 
      required: true 
    },
    isVerifiedPurchase: { 
      type: Boolean, 
      default: true,
      index: true
    },
    helpful: { 
      type: Number, 
      default: 0 
    },
    unhelpful: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
ReviewSchema.index({ productId: 1, rating: 1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
