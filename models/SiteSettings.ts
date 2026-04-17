import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const SiteSettingsSchema = new Schema(
  {
    companyName: { type: String, default: 'DNR Techno Services' },
    logo: { type: String, default: '/logo-dnr.png' },
    primaryPhone: { type: String, default: '' },
    secondaryPhone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    address: String,
    phone: [String],
    email: String,
    website: String,
    mapLink: String,
    coverageStates: [String],
    footerDescription: { type: String, default: '' },
    headerCtaLabel: { type: String, default: 'Talk to an Expert' },
    headerCtaTarget: { type: String, default: '#contact' },
    headerCtaActionType: {
      type: String,
      enum: ['scroll', 'whatsapp', 'phone', 'email', 'custom'],
      default: 'scroll',
    },
    headerCtaValue: { type: String, default: '#contact' },
    contactCtaLabel: { type: String, default: 'Send inquiry' },
    floatingSupportEnabled: { type: Boolean, default: true },
    floatingSupportLabel: { type: String, default: 'WhatsApp Support' },
    inquiryIntro: { type: String, default: '' },
    inquiryResponseText: { type: String, default: '' },
    footerLinks: [
      {
        label: String,
        href: String,
      },
    ],
    contactQuickLinks: [
      {
        label: String,
        type: { type: String, enum: ['phone', 'email', 'whatsapp', 'link'], default: 'link' },
        value: String,
        href: String,
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    inquiryForm: {
      heading: String,
      description: String,
      fields: {
        name: { type: Boolean, default: true },
        company: { type: Boolean, default: true },
        phone: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        productInterest: { type: Boolean, default: true },
        message: { type: Boolean, default: true },
      },
      labels: {
        name: String,
        company: String,
        phone: String,
        email: String,
        productInterest: String,
        message: String,
        submit: String,
      },
    },
    seo: {
      title: String,
      description: String,
      ogImage: String,
    },
  },
  { timestamps: true }
);

export const SiteSettings = models.SiteSettings || model('SiteSettings', SiteSettingsSchema);
