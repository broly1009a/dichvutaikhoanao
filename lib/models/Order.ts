import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  productId: string;
  accountId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: 'bank' | 'wallet' | 'credit_card';
  paymentStatus: 'unpaid' | 'paid' | 'failed';
  account?: {
    username: string;
    password: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { 
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
    accountId: { 
      type: String, 
      required: true,
      index: true,
      ref: 'Account'
    },
    quantity: { 
      type: Number, 
      required: true,
      default: 1
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentMethod: { 
      type: String, 
      enum: ['bank', 'wallet', 'credit_card'],
      required: true
    },
    paymentStatus: { 
      type: String, 
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid',
      index: true
    },
    account: {
      username: String,
      password: String
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for fast queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
OrderSchema.index({ orderId: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
