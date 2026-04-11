import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    gallery: [{ type: String }],
    specs: [{ label: String, value: String }],
    applications: [String],
    features: [String],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    seo: {
      title: String,
      description: String,
      ogImage: String,
    },
  },
  { timestamps: true }
);

export const Product = models.Product || model('Product', ProductSchema);
