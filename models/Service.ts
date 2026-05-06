import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: '' },
    image: { type: String },
    expectedOutcomes: { type: [String], default: [] },
    slug: { type: String, unique: true, index: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = models.Service || model('Service', ServiceSchema);
