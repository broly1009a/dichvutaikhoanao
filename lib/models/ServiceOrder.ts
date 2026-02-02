import mongoose, { Schema, Document } from 'mongoose';

export interface IProductLink {
  url: string;
  quantity: number;
}

export interface IShippingInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district?: string;
  ward?: string;
}

export interface IServiceOrder extends Document {
  userId: mongoose.Types.ObjectId;
  serviceType: string; // e.g., "tiktok-follow", "shopee-order"
  platform: string; // e.g., "tiktok", "shopee", "lazada"
  server: string; // e.g., "sv1", "sv2", "sv3"
  serverId: string;
  serverName: string;
  priceMultiplier: number;
  estimatedTime: string; // e.g., "2-4 giờ"
  region?: string; // e.g., "vn", "global"
  quality?: string; // e.g., "standard", "high", "premium"
  qualityMultiplier: number;
  productLinks: IProductLink[];
  shippingInfo?: IShippingInfo;
  note?: string;
  totalPrice: number;
  basePrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'wallet';
  processStartedAt?: Date;
  processCompletedAt?: Date;
  failureReason?: string;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceOrderSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      index: true,
      ref: 'User'
    },
    serviceType: { 
      type: String, 
      required: true,
      index: true
    },
    platform: { 
      type: String, 
      required: true,
      index: true
    },
    server: { 
      type: String, 
      required: true 
    },
    serverId: { 
      type: String, 
      required: true 
    },
    serverName: { 
      type: String, 
      required: true 
    },
    priceMultiplier: { 
      type: Number, 
      required: true,
      default: 1.0
    },
    estimatedTime: { 
      type: String, 
      required: true 
    },
    region: { 
      type: String 
    },
    quality: { 
      type: String 
    },
    qualityMultiplier: { 
      type: Number,
      default: 1.0
    },
    productLinks: [{
      url: { type: String, required: true },
      quantity: { type: Number, required: true }
    }],
    shippingInfo: {
      fullName: { type: String },
      phoneNumber: { type: String },
      address: { type: String },
      province: { type: String },
      district: { type: String },
      ward: { type: String }
    },
    note: { 
      type: String 
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    basePrice: { 
      type: Number, 
      required: true,
      default: 50
    },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed'],
      default: 'pending',
      index: true
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true
    },
    paymentMethod: { 
      type: String, 
      enum: ['wallet'],
      default: 'wallet'
    },
    processStartedAt: { 
      type: Date 
    },
    processCompletedAt: { 
      type: Date 
    },
    failureReason: { 
      type: String 
    },
    refundAmount: { 
      type: Number 
    }
  },
  { timestamps: true }
);

// Indexes for fast queries
ServiceOrderSchema.index({ userId: 1, createdAt: -1 });
ServiceOrderSchema.index({ status: 1, paymentStatus: 1 });
ServiceOrderSchema.index({ platform: 1, status: 1 });
ServiceOrderSchema.index({ serviceType: 1, createdAt: -1 });

export default mongoose.models.ServiceOrder || mongoose.model<IServiceOrder>('ServiceOrder', ServiceOrderSchema);
