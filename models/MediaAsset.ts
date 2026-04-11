import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const MediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    key: { type: String },
    type: { type: String, default: 'image' },
    title: { type: String, default: '' },
    alt: { type: String, default: '' },
    uploadedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export const MediaAsset = models.MediaAsset || model('MediaAsset', MediaAssetSchema);
