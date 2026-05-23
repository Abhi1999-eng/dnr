import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true, default: '' },
    featuredImage: { type: String, default: '' },
    featuredImageAlt: { type: String, default: '' },
    authorName: { type: String, default: '' },
    authorImage: { type: String, default: '' },
    category: { type: String, default: '' },
    tags: { type: [String], default: [] },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Blog = mongoose.models?.Blog || mongoose.model('Blog', BlogSchema);
