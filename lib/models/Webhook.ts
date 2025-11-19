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
  orderCode?: number;
  paymentLinkId?: string;
  code?: string;
  desc?: string;
  signature?: string;
}

export interface IWebhook extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  desc: string;
  success: boolean;
  data: IWebhookData;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: Date; // TTL: auto-delete after 24 hours
  createdAt: Date;
  updatedAt: Date;
}

const WebhookDataSchema = new Schema<IWebhookData>({
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  reference: { type: String, required: true },
  transactionDateTime: { type: String, required: true },
  virtualAccountNumber: { type: String, default: '' },
  counterAccountBankId: { type: String, default: '' },
  counterAccountBankName: { type: String, default: '' },
  counterAccountName: { type: String, default: '' },
  counterAccountNumber: { type: String, default: '' },
  virtualAccountName: { type: String, default: '' },
  currency: { type: String, default: 'VND' },
  orderCode: { type: Number },
  paymentLinkId: { type: String },
  code: { type: String, default: '00' },
  desc: { type: String, default: 'success' },
  signature: { type: String }
});

const WebhookSchema = new Schema<IWebhook>({
  code: { type: String, required: true, default: '00' },
  desc: { type: String, required: true, default: 'success' },
  success: { type: Boolean, required: true, default: true },
  data: { type: WebhookDataSchema, required: true },
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