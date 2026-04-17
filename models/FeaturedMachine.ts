import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const FeaturedMachineSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, default: '' },
    image: { type: String, default: '' },
    gallery: [{ type: String }],
    bullets: [{ type: String }],
    ctaLabel: { type: String, default: 'Request Details' },
    ctaLink: { type: String, default: '#contact' },
    featured: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FeaturedMachine = models.FeaturedMachine || model('FeaturedMachine', FeaturedMachineSchema);
