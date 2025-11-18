import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  actor: string; // userId hoặc admin
  actorRole: 'admin' | 'customer' | 'system';
  target: 'product' | 'account' | 'user' | 'order' | 'transaction';
  targetId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    action: { 
      type: String, 
      required: true,
      index: true
    },
    actor: { 
      type: String, 
      required: true,
      index: true
    },
    actorRole: { 
      type: String, 
      enum: ['admin', 'customer', 'system'],
      required: true,
      index: true
    },
    target: { 
      type: String, 
      enum: ['product', 'account', 'user', 'order', 'transaction'],
      required: true,
      index: true
    },
    targetId: { 
      type: String, 
      required: true,
      index: true
    },
    changes: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed
      }
    ],
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { 
      type: String, 
      enum: ['success', 'failed'],
      default: 'success',
      index: true
    },
  },
  { timestamps: false }
);

// Index for fast queries
AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ target: 1, targetId: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
