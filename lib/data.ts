import { connectDB } from './db';
import { Service } from '@/models/Service';
import { Testimonial } from '@/models/Testimonial';
import { Content } from '@/models/Content';
import { Product } from '@/models/Product';
import { HomepageContent } from '@/models/HomepageContent';
import { SiteSettings } from '@/models/SiteSettings';
import { ClientLogo } from '@/models/ClientLogo';

export async function fetchPublicData() {
  await connectDB();
  const [services, testimonials, contents, products, homepage, settings, clientLogos] = await Promise.all([
    Service.find({ active: { $ne: false } }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    Testimonial.find().lean(),
    Content.find().lean(),
    Product.find().sort({ createdAt: -1 }).lean(),
    HomepageContent.findOne().lean(),
    SiteSettings.findOne().lean(),
    ClientLogo.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
  ]);
  const contentMap: Record<string, any> = {};
  contents.forEach((c: any) => (contentMap[c.key] = c.data));
  return {
    services: JSON.parse(JSON.stringify(services)),
    testimonials: JSON.parse(JSON.stringify(testimonials)),
    products: JSON.parse(JSON.stringify(products)),
    homepage: JSON.parse(JSON.stringify(homepage || {})),
    settings: JSON.parse(JSON.stringify(settings || {})),
    clientLogos: JSON.parse(JSON.stringify(clientLogos || [])),
    contents: contentMap,
  };
}
