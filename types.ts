export type ProductType = {
  _id?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
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
