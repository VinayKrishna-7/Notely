import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITag extends Document {
  user: Types.ObjectId;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },
    color: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique tag per user
TagSchema.index({ user: 1, name: 1 }, { unique: true });

export const Tag = mongoose.model<ITag>('Tag', TagSchema);
