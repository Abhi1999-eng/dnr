import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const HomepageContentSchema = new Schema(
  {
    sections: {
      hero: {
        title: { type: String, default: 'Hero' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      categories: {
        title: { type: String, default: 'Product Categories' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
        buttonLabel: { type: String, default: 'View all products' },
        buttonHref: { type: String, default: '/products' },
      },
      services: {
        title: { type: String, default: 'Services that keep plants online' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      whyChoose: {
        title: { type: String, default: 'Why choose DNR' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      coverage: {
        title: { type: String, default: 'Pan-India coverage' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
        summaryTitle: { type: String, default: 'Coverage network' },
        summaryText: { type: String, default: '' },
      },
      industries: {
        title: { type: String, default: 'Where DNR machinery runs' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      trust: {
        title: { type: String, default: 'Why teams trust DNR' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      clients: {
        title: { type: String, default: 'Associated Brands' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      featuredMachines: {
        title: { type: String, default: 'Featured Machine' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      inquiry: {
        title: { type: String, default: 'Talk to an expert' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
      testimonials: {
        title: { type: String, default: 'Trusted by plant heads and maintenance leaders' },
        kicker: { type: String, default: '' },
        visible: { type: Boolean, default: true },
      },
    },
    hero: {
      heading: String,
      subheading: String,
      ctaPrimary: String,
      ctaSecondary: String,
      tagline: String,
    },
    heroStats: [
      {
        label: String,
        value: String,
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    about: {
      heading: String,
      body: String,
      bullets: [String],
    },
    why: [
      {
        title: String,
        description: String,
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    industries: [
      {
        title: String,
        description: String,
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    trustCards: [
      {
        title: String,
        description: String,
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    coverageStates: [
      {
        stateId: String,
        label: String,
        description: String,
        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    featuredCategories: [String], // category slugs
    stats: {
      plants: String,
      response: String,
      experience: String,
    },
    seo: {
      title: String,
      description: String,
      ogImage: String,
    },
  },
  { timestamps: true }
);

export const HomepageContent = models.HomepageContent || model('HomepageContent', HomepageContentSchema);
