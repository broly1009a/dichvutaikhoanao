import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  description?: string;
  platform: 'tiktok' | 'shopee' | 'lazada' | 'gmail' | 'hotmail';
  icon?: string;
  image?: string;
  productCount: number;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      index: true 
    },
    description: { type: String },
    platform: { 
      type: String, 
      required: true,
      enum: ['tiktok', 'shopee', 'lazada', 'gmail', 'hotmail'],
      index: true 
    },
    icon: { type: String }, // Icon name từ lucide-react
    image: { type: String }, // URL hình ảnh
    productCount: { 
      type: Number, 
      default: 0,
      index: true 
    },
    displayOrder: { 
      type: Number, 
      default: 0 
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'],
      default: 'active',
      index: true 
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
CategorySchema.index({ platform: 1, status: 1 });
CategorySchema.index({ platform: 1, displayOrder: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
