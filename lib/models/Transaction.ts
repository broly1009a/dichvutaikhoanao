import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'purchase' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: 'bank' | 'wallet' | 'credit_card' | 'crypto';
  description?: string;
  relatedOrderId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    transactionId: { 
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
    type: { 
      type: String, 
      enum: ['deposit', 'withdraw', 'purchase', 'refund'],
      required: true,
      index: true
    },
    amount: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    method: { 
      type: String, 
      enum: ['bank', 'wallet', 'credit_card', 'crypto'],
      required: true
    },
    description: { type: String },
    relatedOrderId: { 
      type: String,
      ref: 'Order'
    },
    balanceBefore: { 
      type: Number, 
      required: true 
    },
    balanceAfter: { 
      type: Number, 
      required: true 
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ transactionId: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
