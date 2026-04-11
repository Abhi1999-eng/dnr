import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category = models.Category || model('Category', CategorySchema);
