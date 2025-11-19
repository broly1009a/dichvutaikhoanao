import mongoose, { Schema, Document } from 'mongoose';

export type CardType = 'viettel' | 'mobifone' | 'vinaphone' | 'vietnamobile' | 'gmobile' | 'zing' | 'gate' | 'garena' | 'vcoin';

export interface ICardDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  cardType: CardType;
  serial: string;
  pin: string;
  amount: number; // Mệnh giá thẻ
  actualAmount: number; // Số tiền thực nhận sau khi trừ phí
  status: 'pending' | 'completed' | 'failed' | 'processing';
  transactionId?: string;
  processedAt?: Date;
  reason?: string; // Lý do thất bại nếu có
  createdAt: Date;
  updatedAt: Date;
}

const CardDepositSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'User'
  },
  cardType: {
    type: String,
    required: true,
    enum: ['viettel', 'mobifone', 'vinaphone', 'vietnamobile', 'gmobile', 'zing', 'gate', 'garena', 'vcoin'],
    index: true
  },
  serial: {
    type: String,
    required: true,
    trim: true
  },
  pin: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10000,
    max: 500000
  },
  actualAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'processing'],
    default: 'pending',
    index: true
  },
  transactionId: {
    type: String,
    sparse: true,
    index: true
  },
  processedAt: {
    type: Date
  },
  reason: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Indexes for fast queries
CardDepositSchema.index({ userId: 1, createdAt: -1 });
CardDepositSchema.index({ status: 1, createdAt: -1 });
CardDepositSchema.index({ cardType: 1, status: 1 });

export default mongoose.models.CardDeposit || mongoose.model<ICardDeposit>('CardDeposit', CardDepositSchema);