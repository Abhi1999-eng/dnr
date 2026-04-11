import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const SiteSettingsSchema = new Schema(
  {
    address: String,
    phone: [String],
    email: String,
    website: String,
    mapLink: String,
    coverageStates: [String],
    seo: {
      title: String,
      description: String,
      ogImage: String,
    },
  },
  { timestamps: true }
);

export const SiteSettings = models.SiteSettings || model('SiteSettings', SiteSettingsSchema);
