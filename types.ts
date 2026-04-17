export type CategoryType = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
  featured?: boolean;
};

export type ProductType = {
  _id?: string;
  title: string;
  slug: string;
  category?: CategoryType;
  shortDescription?: string;
  description?: string;
  image?: string;
  heroImage?: string;
  gallery?: string[];
  specs?: { label: string; value: string }[];
  applications?: string[];
  features?: string[];
  featured?: boolean;
};

export type ClientLogoType = {
  _id?: string;
  name: string;
  logoImage?: string;
  externalUrl?: string;
  sortOrder?: number;
  active?: boolean;
};

export type FeaturedMachineType = {
  _id?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  image?: string;
  gallery?: string[];
  bullets?: string[];
  ctaLabel?: string;
  ctaLink?: string;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
};
