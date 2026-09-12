import mongoose, { Document, Schema, Types } from 'mongoose';
import { NoteColorType } from './Note';

export interface INoteVersion extends Document {
  note: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  color: NoteColorType;
  changeSummary?: string;
  createdAt: Date;
}

const NoteVersionSchema = new Schema<INoteVersion>(
  {
    note: {
      type: Schema.Types.ObjectId,
      ref: 'Note',
      required: [true, 'Note reference is required'],
      index: true,
    },
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
    },
    content: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      enum: ['default', 'rose', 'amber', 'emerald', 'sky', 'indigo', 'violet'],
      default: 'default',
    },
    changeSummary: {
      type: String,
      default: 'Note updated',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for fast lookup and user scoping
NoteVersionSchema.index({ note: 1, createdAt: -1 });
NoteVersionSchema.index({ user: 1, createdAt: -1 });

export const NoteVersion = mongoose.model<INoteVersion>('NoteVersion', NoteVersionSchema);
