import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const HomepageContentSchema = new Schema(
  {
    hero: {
      heading: String,
      subheading: String,
      ctaPrimary: String,
      ctaSecondary: String,
      tagline: String,
    },
    about: {
      heading: String,
      body: String,
      bullets: [String],
    },
    why: [String],
    industries: [String],
    coverageStates: [String],
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
