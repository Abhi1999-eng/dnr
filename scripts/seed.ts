import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { Service } from '../models/Service.js';
import { Testimonial } from '../models/Testimonial.js';
import { Content } from '../models/Content.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { HomepageContent } from '../models/HomepageContent.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { AdminUser } from '../models/AdminUser.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnr-modern';
const PRODUCT_DATA_PATH =
  process.env.PRODUCT_DATA_PATH ||
  '/Users/abhishekchaubey/Downloads/dnr_products_enriched_no_images/dnr_products_enriched.json';

const imageMap: Record<string, string> = {
  'pressure-die-casting-machine': '/dnr/page_06.png',
  'gravity-die-casting-machine': '/dnr/page_10.png',
  'sand-core-shooting-machine': '/dnr/page_12.png',
  'automatic-moulding-machine': '/dnr/page_13.png',
  'cnc-turning-machine': '/dnr/page_21.png',
  'cnc-turn-mill-centre': '/dnr/page_16.png',
  vmc: '/dnr/page_19.png',
  hmc: '/dnr/page_18.png',
  vtl: '/dnr/page_20.png',
  'rotary-transfer-machine': '/dnr/page_22.png',
  'fiber-laser-marking-machine': '/dnr/page_23.png',
  'tool-grinding-peeling-machine': '/dnr/page_24.png',
  'auto-polishing-machine': '/dnr/page_25.png',
  'water-leakage-testing-machine': '/dnr/page_27.png',
};

function slugify(text = '') {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  await Promise.all([
    Service.deleteMany({}),
    Testimonial.deleteMany({}),
    Content.deleteMany({}),
    AdminUser.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    HomepageContent.deleteMany({}),
    SiteSettings.deleteMany({}),
  ]);

  await AdminUser.create({ email: 'admin@dnr.com', password: 'admin123', name: 'Admin' });

  const productFile = path.resolve(PRODUCT_DATA_PATH);
  const raw = JSON.parse(await fs.readFile(productFile, 'utf8'));

  const services = [
    {
      title: 'Thermal Imaging Surveys',
      description: 'IR thermography for electrical panels, furnaces, refractory, and rotating equipment to spot hotspots before failure.',
      image: 'https://images.unsplash.com/photo-1519337265831-281ec6cc8514',
      slug: 'thermal-imaging-surveys',
    },
    {
      title: 'Vibration Analysis',
      description: 'Route-based vibration monitoring, spectrum analysis, and root-cause recommendations for rotating assets.',
      image: 'https://images.unsplash.com/photo-1582719478248-44e9bcd27791',
      slug: 'vibration-analysis',
    },
    {
      title: 'Ultrasound & Air Leak Detection',
      description: 'Compressed-air leak detection, steam trap inspection, and lubrication optimization with ultrasound.',
      image: 'https://images.unsplash.com/photo-1582719478144-8b83859d0aa6',
      slug: 'ultrasound-air-leak-detection',
    },
    {
      title: 'Energy & Reliability Audits',
      description: 'Comprehensive audits combining thermal, vibration, and electrical measurements to boost availability and efficiency.',
      image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a',
      slug: 'energy-reliability-audits',
    },
    {
      title: 'OEM Machine Tool Services',
      description: 'Support for CNC, VMC, die-casting and foundry machines including installation, calibration, and AMC.',
      image: 'https://images.unsplash.com/photo-1581091012184-5c1f9f7fd3d5',
      slug: 'oem-machine-tool-services',
    },
    {
      title: 'On-site Reliability Engineering',
      description: 'Embedded reliability programs with dashboards, spares planning, and predictive routes.',
      image: 'https://images.unsplash.com/photo-1503389152951-9f343605f61e',
      slug: 'on-site-reliability-engineering',
    },
  ];
  await Service.insertMany(services);

  await Testimonial.insertMany([
    { name: 'Maintenance Head, Automotive OEM', feedback: 'DNR’s casting cell upgrade reduced downtime and improved part quality. Responsive support team.', rating: 5 },
    { name: 'Plant Manager, Foundry', feedback: 'Their die casting and CNC recommendations cut our cycle time significantly.', rating: 5 },
    { name: 'Production Lead, Automotive Tier-1', feedback: 'Smooth installation and training for the new VMC line. Good documentation.', rating: 4 },
  ]);

  const DEFAULT_IMAGE = '/dnr/page_06.png';

  const categoryNames: string[] = Array.from(
    new Set(
      raw
        .map((p: any) => p.category)
        .filter(Boolean)
        .map((c: string) => c.trim())
    )
  ) as string[];

  const categories = await Category.insertMany(
    categoryNames.map((name: string, idx: number) => {
      const slug = slugify(name);
      return {
        name,
        slug,
        description: `${name} solutions by DNR Techno Services.`,
        coverImage: imageMap[slug] || DEFAULT_IMAGE,
        sortOrder: idx + 1,
      };
    })
  );

  const categoryByName = new Map(categories.map((c) => [c.name, c]));
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const productsToInsert = raw.map((p: any) => {
    const cat =
      categoryByName.get(p.category) ||
      categoryBySlug.get(slugify(p.category || '')) ||
      null;
    const slug = p.slug || slugify(p.name);
    const heroImage = imageMap[slug] || cat?.coverImage || DEFAULT_IMAGE;
    const shortDescription =
      p.description && p.description.length > 140 ? `${p.description.slice(0, 140)}…` : p.description;

    const features = [];
    if (p.notes) {
      features.push(...p.notes.split(';').map((n: string) => n.trim()).filter(Boolean));
    }

    return {
      title: p.name,
      slug,
      category: cat?._id,
      shortDescription,
      description: p.description,
      applications: p.applications || [],
      features,
      heroImage,
      image: heroImage,
      published: true,
    };
  });

  await Product.insertMany(productsToInsert);

  await HomepageContent.create({
    hero: {
      heading: 'Your service partner for precision machinery & reliability',
      subheading: 'Casting, machining, marking, polishing, and testing solutions with pan-India support.',
      ctaPrimary: 'View products',
      ctaSecondary: 'Contact us',
      tagline: 'DNR Techno Services — Industrial partners since 2010',
    },
    about: {
      heading: 'Engineer-owned. Customer-obsessed.',
      body: 'We pair intelligent machining solutions with pre & post-sales support to keep your lines online.',
      bullets: ['Application engineering & sizing', 'Installation & commissioning', 'Training and documentation', '24x7 service & spares'],
    },
    why: [
      'Technical expertise across casting, machining, marking, testing',
      'Pre & post-sales support with spares and documentation',
      'Wide machine range to match budgets and footprints',
      'Customer satisfaction and repeat engagements across India',
    ],
    coverageStates: ['Delhi NCR', 'Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Punjab', 'Rajasthan'],
  });

  await SiteSettings.create({
    address: '27-A, Parda Bagh, Darya Ganj, New Delhi – 110002, India',
    phone: ['+91 9711196735', '+91 9911399919'],
    email: 'dnr.techservices@gmail.com',
    website: 'www.dnrtechnoservices.com',
    coverageStates: ['Delhi NCR', 'Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Punjab', 'Rajasthan'],
  });

  await Content.create({
    key: 'hero',
    data: {
      title: 'Your service partner for critical assets',
      subtitle: 'Engineer-owned reliability team delivering thermal, vibration, and ultrasound diagnostics across India.',
      cta: 'Book an audit',
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seeded');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
