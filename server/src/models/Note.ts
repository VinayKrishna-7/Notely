import mongoose, { Document, Schema, Types } from 'mongoose';

export type NoteColorType = 'default' | 'rose' | 'amber' | 'emerald' | 'sky' | 'indigo' | 'violet';

export interface INote extends Document {
  user: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  color: NoteColorType;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  sortOrder: number;
  isDaily: boolean;
  dailyDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    color: {
      type: String,
      enum: ['default', 'rose', 'amber', 'emerald', 'sky', 'indigo', 'violet'],
      default: 'default',
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isDaily: {
      type: Boolean,
      default: false,
      index: true,
    },
    dailyDate: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high performance querying and sorting
NoteSchema.index({ user: 1, isDeleted: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ user: 1, isDeleted: 1, isFavorite: 1, updatedAt: -1 });
NoteSchema.index({ user: 1, tags: 1, isDeleted: 1 });
NoteSchema.index({ user: 1, dailyDate: 1 });
NoteSchema.index({ user: 1, sortOrder: 1 });

// Full text search index
NoteSchema.index({ title: 'text', content: 'text' });

export const Note = mongoose.model<INote>('Note', NoteSchema);
