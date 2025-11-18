import mongoose, { Schema, Document } from 'mongoose';

export type ProviderType = 'internal' | 'external_api' | 'manual_upload';

export interface IProvider extends Document {
  name: string; // Tên provider (ví dụ: "ShopeeAPI", "TikTokSeller", etc.)
  type: ProviderType;
  description?: string;
  
  // External API config
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  authenticationType?: 'bearer' | 'api_key' | 'oauth' | 'basic';
  
  // Mapping
  supportedPlatforms: string[]; // ['tiktok', 'shopee', 'gmail']
  
  // Rate limiting
  requestsPerMinute: number;
  maxRequestsPerDay: number;
  
  // Status
  status: 'active' | 'inactive' | 'testing';
  isHealthy: boolean;
  lastHealthCheck?: Date;
  errorMessage?: string;
  
  // Statistics
  totalAccountsFetched: number;
  lastSyncTime?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    type: { 
      type: String, 
      required: true, 
      enum: ['internal', 'external_api', 'manual_upload'],
      index: true 
    },
    description: { type: String },
    
    // External API config
    apiUrl: { type: String },
    apiKey: { type: String },
    apiSecret: { type: String },
    authenticationType: { 
      type: String, 
      enum: ['bearer', 'api_key', 'oauth', 'basic']
    },
    
    // Mapping
    supportedPlatforms: [{ type: String }],
    
    // Rate limiting
    requestsPerMinute: { type: Number, default: 100 },
    maxRequestsPerDay: { type: Number, default: 10000 },
    
    // Status
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'testing'],
      default: 'testing',
      index: true
    },
    isHealthy: { 
      type: Boolean, 
      default: true 
    },
    lastHealthCheck: { type: Date },
    errorMessage: { type: String },
    
    // Statistics
    totalAccountsFetched: { 
      type: Number, 
      default: 0 
    },
    lastSyncTime: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Provider || mongoose.model<IProvider>('Provider', ProviderSchema);
