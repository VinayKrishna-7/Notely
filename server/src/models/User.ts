import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  themePreference: 'light' | 'dark' | 'system';
  editorPreferences: {
    defaultMode: 'edit' | 'split' | 'preview';
    autoSaveDelay: number;
    density: 'comfortable' | 'compact';
  };
  clockPreferences: {
    enabled: boolean;
    style: 'minimal' | 'dateTime' | 'digital' | 'compact' | 'productivity' | 'seconds' | 'focus' | 'analog';
    timeFormat: '12h' | '24h';
    showSeconds: boolean;
    showDate: boolean;
    accent: 'neutral' | 'accent' | 'muted';
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password by default in queries
    },
    avatar: {
      type: String,
      default: '',
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    editorPreferences: {
      defaultMode: {
        type: String,
        enum: ['edit', 'split', 'preview'],
        default: 'edit',
      },
      autoSaveDelay: {
        type: Number,
        default: 1200,
      },
      density: {
        type: String,
        enum: ['comfortable', 'compact'],
        default: 'comfortable',
      },
    },
    clockPreferences: {
      enabled: {
        type: Boolean,
        default: true,
      },
      style: {
        type: String,
        enum: ['minimal', 'dateTime', 'digital', 'compact', 'productivity', 'seconds', 'focus', 'analog'],
        default: 'minimal',
      },
      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h',
      },
      showSeconds: {
        type: Boolean,
        default: false,
      },
      showDate: {
        type: Boolean,
        default: false,
      },
      accent: {
        type: String,
        enum: ['neutral', 'accent', 'muted'],
        default: 'neutral',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
