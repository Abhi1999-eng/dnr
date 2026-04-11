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
