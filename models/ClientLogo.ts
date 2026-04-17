import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const ClientLogoSchema = new Schema(
  {
    name: { type: String, required: true },
    logoImage: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ClientLogo = models.ClientLogo || model('ClientLogo', ClientLogoSchema);
