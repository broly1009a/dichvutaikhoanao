import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'seller';
  status: 'active' | 'blocked' | 'pending';
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      index: true
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    fullName: { 
      type: String, 
      required: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    avatar: { type: String },
    role: { 
      type: String, 
      enum: ['customer', 'admin', 'seller'],
      default: 'customer',
      index: true
    },
    status: { 
      type: String, 
      enum: ['active', 'blocked', 'pending'],
      default: 'active',
      index: true
    },
    balance: { 
      type: Number, 
      default: 0 
    },
    totalPurchased: { 
      type: Number, 
      default: 0 
    },
    totalSpent: { 
      type: Number, 
      default: 0 
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
