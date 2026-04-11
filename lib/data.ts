import { connectDB } from './db';
import { Service } from '@/models/Service';
import { Testimonial } from '@/models/Testimonial';
import { Content } from '@/models/Content';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { HomepageContent } from '@/models/HomepageContent';
import { SiteSettings } from '@/models/SiteSettings';

export async function fetchPublicData() {
  await connectDB();
  const [services, testimonials, contents, products, categories, homepage, settings] = await Promise.all([
    Service.find().lean(),
    Testimonial.find().lean(),
    Content.find().lean(),
    Product.find({ published: true }).populate('category').lean(),
    Category.find().sort({ sortOrder: 1 }).lean(),
    HomepageContent.findOne().lean(),
    SiteSettings.findOne().lean(),
  ]);
  const contentMap: Record<string, any> = {};
  contents.forEach((c: any) => (contentMap[c.key] = c.data));
  return {
    services: JSON.parse(JSON.stringify(services)),
    testimonials: JSON.parse(JSON.stringify(testimonials)),
    products: JSON.parse(JSON.stringify(products)),
    categories: JSON.parse(JSON.stringify(categories)),
    homepage: JSON.parse(JSON.stringify(homepage || {})),
    settings: JSON.parse(JSON.stringify(settings || {})),
    contents: contentMap,
  };
}
