import mongoose, { Schema, Document } from 'mongoose';

export type AccountType = 'email' | 'tiktok' | 'facebook' | 'shopee' | 'lazada' | 'gmail' | 'hotmail' | 'instagram' | 'twitter' | 'youtube' | 'twitch' | 'discord';

export interface IAccount extends Document {
  productId: string;
  accountType: AccountType; // Loại tài khoản
  username: string;
  password: string;
  email?: string;
  phone?: string;
  recoveryEmail?: string;
  recoveryPhone?: string;
  additionalInfo?: Record<string, any>; // Lưu các thông tin khác tuỳ loại
  status: 'available' | 'sold' | 'reserved';
  createdAt: Date;
  soldAt?: Date;
  soldTo?: string; // User ID khi bán
  notes?: string;
}

const AccountSchema: Schema = new Schema(
  {
    productId: { 
      type: String, 
      required: true, 
      index: true,
      ref: 'Product'
    },
    accountType: { 
      type: String, 
      required: true, 
      enum: ['email', 'tiktok', 'facebook', 'shopee', 'lazada', 'gmail', 'hotmail', 'instagram', 'twitter', 'youtube', 'twitch', 'discord'],
      index: true
    },
    username: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    email: { type: String },
    phone: { type: String },
    recoveryEmail: { type: String },
    recoveryPhone: { type: String },
    additionalInfo: { 
      type: Schema.Types.Mixed,
      default: {} 
    }, // Lưu followers, coins, level, v.v.
    status: { 
      type: String, 
      required: true, 
      enum: ['available', 'sold', 'reserved'],
      index: true,
      default: 'available'
    },
    soldAt: { type: Date },
    soldTo: { type: String, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound indexes for fast queries
AccountSchema.index({ productId: 1, status: 1 });
AccountSchema.index({ productId: 1, createdAt: -1 });
AccountSchema.index({ status: 1, createdAt: -1 });
AccountSchema.index({ accountType: 1, status: 1 });

export default mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
