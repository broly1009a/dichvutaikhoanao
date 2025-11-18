import mongoose, { Schema, Document } from 'mongoose';

export type Platform = 'tiktok' | 'shopee' | 'lazada' | 'gmail' | 'hotmail';

export interface IProduct extends Document {
  id: string;
  platform: Platform;
  category: string;
  title: string;
  description: string;
  price: number;
  status: 'available' | 'soldout';
  accountCount: number; // Tổng số tài khoản
  availableCount: number; // Số tài khoản còn available
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    platform: { 
      type: String, 
      required: true, 
      enum: ['tiktok', 'shopee', 'lazada', 'gmail', 'hotmail'],
      index: true 
    },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['available', 'soldout'],
      index: true 
    },
    accountCount: { type: Number, default: 0 },
    availableCount: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

// Index để query nhanh
ProductSchema.index({ platform: 1, category: 1 });
ProductSchema.index({ status: 1, platform: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
