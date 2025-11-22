import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhookData {
  accountNumber: string;
  amount: number;
  description: string;
  reference: string;
  transactionDateTime: string;
  virtualAccountNumber?: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  currency?: string;
  orderCode?: string | number; // Support both string and number for int64
  paymentLinkId?: string;
  code?: string;
  desc?: string;
  // signature removed - moved to root level
}

export interface IWebhook extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  desc: string;
  success: boolean;
  data: IWebhookData;
  signature: string; // Move signature to root level
  status: 'pending' | 'completed' | 'expired';
  expiresAt: Date; // TTL: auto-delete after 24 hours
  createdAt: Date;
  updatedAt: Date;
}

const WebhookDataSchema = new Schema<IWebhookData>({
  accountNumber: { type: String },
  amount: { type: Number },
  description: { type: String },
  reference: { type: String },
  transactionDateTime: { type: String },
  virtualAccountNumber: { type: String, default: '' },
  counterAccountBankId: { type: String, default: '' },
  counterAccountBankName: { type: String, default: '' },
  counterAccountName: { type: String, default: '' },
  counterAccountNumber: { type: String, default: '' },
  virtualAccountName: { type: String, default: '' },
  currency: { type: String, default: 'VND' },
  orderCode: { type: Schema.Types.Mixed }, // Support both string and number for int64
  paymentLinkId: { type: String },
  code: { type: String, default: '00' },
  desc: { type: String, default: 'success' }
  // signature removed - moved to root level
}, { strict: false });

const WebhookSchema = new Schema<IWebhook>({
  code: { type: String, default: '00' },
  desc: { type: String, default: 'success' },
  success: { type: Boolean, default: true },
  data: { type: WebhookDataSchema },
  signature: { type: String }, // Move signature to root level
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// TTL Index: MongoDB automatically deletes documents when expiresAt is reached
WebhookSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for fast lookup by description (UUID)
WebhookSchema.index({ 'data.description': 1, status: 1 });

// Index for fast lookup by orderCode
WebhookSchema.index({ 'data.orderCode': 1, status: 1 });

export default mongoose.models.Webhook || mongoose.model<IWebhook>('Webhook', WebhookSchema);