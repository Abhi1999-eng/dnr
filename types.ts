export type ProductType = {
  _id?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  youtubeUrl?: string;
  image?: string;
  heroImage?: string;
  gallery?: string[];
  specs?: { label: string; value: string }[];
  applications?: string[];
  features?: string[];
};

export type ClientLogoType = {
  _id?: string;
  name: string;
  logoImage?: string;
  externalUrl?: string;
  sortOrder?: number;
  active?: boolean;
};

export type BlogType = {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  authorName?: string;
  authorImage?: string;
  category?: string;
  tags?: string[];
  relatedProducts?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
