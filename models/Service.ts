import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    slug: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

export const Service = models.Service || model('Service', ServiceSchema);
