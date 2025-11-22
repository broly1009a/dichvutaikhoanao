import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string; // User ID who created the invoice
  orderCode: number; // PayOS order code (unique)
  amount: number; // Invoice amount (VND)
  bonus: number; // Bonus amount
  totalAmount: number; // Total = amount + bonus
  status: 'pending' | 'completed' | 'failed' | 'expired'; // Payment status
  description: string; // Invoice description
  paymentMethod: 'payos'; // Payment method used
  paymentDate?: Date; // When payment was completed
  expiresAt: Date; // When invoice expires
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    orderCode: { 
      type: Number, 
      required: true,
      unique: true,
      index: true 
    },
    amount: { 
      type: Number, 
      required: true,
      min: 10000 
    },
    bonus: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'expired'],
      default: 'pending',
      index: true
    },
    description: { 
      type: String, 
      required: true 
    },
    paymentMethod: { 
      type: String,
      enum: ['payos'],
      default: 'payos' 
    },
    paymentDate: { 
      type: Date 
    },
    expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  },
  { timestamps: true }
);

// TTL Index: Auto-delete after 30 days
InvoiceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast queries
InvoiceSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
