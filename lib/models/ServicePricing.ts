import mongoose, { Schema, Document } from 'mongoose';

export interface IServicePricing extends Document {
  serviceType: string; // e.g., "tiktok-follow"
  serviceName: string; // e.g., "TikTok - Tăng Follow"
  platform: string; // e.g., "tiktok"
  basePrice: number; // Giá cơ bản mỗi đơn vị
  minQuantity: number; // Số lượng tối thiểu
  maxQuantity?: number; // Số lượng tối đa
  isActive: boolean; // Còn hoạt động không
  description?: string;
  servers: Array<{
    id: string;
    name: string;
    priceMultiplier: number;
    estimatedTime: string;
    isActive: boolean;
  }>;
  qualityOptions: Array<{
    id: string;
    name: string;
    priceMultiplier: number;
    isActive: boolean;
  }>;
  regions?: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ServicePricingSchema: Schema = new Schema(
  {
    serviceType: { 
      type: String, 
      required: true,
      unique: true,
      index: true
    },
    serviceName: { 
      type: String, 
      required: true 
    },
    platform: { 
      type: String, 
      required: true,
      index: true
    },
    basePrice: { 
      type: Number, 
      required: true,
      min: 0
    },
    minQuantity: { 
      type: Number, 
      required: true,
      default: 100
    },
    maxQuantity: { 
      type: Number,
      min: 0
    },
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    },
    description: { 
      type: String 
    },
    servers: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      priceMultiplier: { type: Number, required: true, min: 0 },
      estimatedTime: { type: String, required: true },
      isActive: { type: Boolean, default: true }
    }],
    qualityOptions: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      priceMultiplier: { type: Number, required: true, min: 0 },
      isActive: { type: Boolean, default: true }
    }],
    regions: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      isActive: { type: Boolean, default: true }
    }]
  },
  { timestamps: true }
);

// Indexes
ServicePricingSchema.index({ platform: 1, isActive: 1 });
ServicePricingSchema.index({ serviceType: 1, isActive: 1 });

export default mongoose.models.ServicePricing || mongoose.model<IServicePricing>('ServicePricing', ServicePricingSchema);
