import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const ContentSchema = new Schema(
  {
    key: { type: String, unique: true, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Content = models.Content || model('Content', ContentSchema);
