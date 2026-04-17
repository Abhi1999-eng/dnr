import mongoose from 'mongoose';
import { Service } from '../models/Service.js';
import { Testimonial } from '../models/Testimonial.js';
import { Content } from '../models/Content.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { HomepageContent } from '../models/HomepageContent.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { AdminUser } from '../models/AdminUser.js';
import { ClientLogo } from '../models/ClientLogo.js';
import { FeaturedMachine } from '../models/FeaturedMachine.js';
import { Inquiry } from '../models/Inquiry.js';
import { MediaAsset } from '../models/MediaAsset.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnr-modern';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dnr.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

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
    ClientLogo.deleteMany({}),
    FeaturedMachine.deleteMany({}),
    Inquiry.deleteMany({}),
    MediaAsset.deleteMany({}),
  ]);

  await AdminUser.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME });

  await SiteSettings.create({
    companyName: 'DNR Techno Services',
    logo: '/logo-dnr.png',
    primaryPhone: '',
    secondaryPhone: '',
    whatsappNumber: '',
    address: '',
    phone: [],
    email: '',
    website: '',
    mapLink: '',
    coverageStates: [],
    footerDescription: '',
    headerCtaLabel: 'Talk to an Expert',
    headerCtaTarget: '#contact',
    contactCtaLabel: 'Send inquiry',
    floatingSupportLabel: 'WhatsApp Support',
    inquiryIntro: '',
    inquiryResponseText: '',
    footerLinks: [],
    contactQuickLinks: [],
    inquiryForm: {
      heading: 'Talk to an expert',
      description: '',
      fields: { name: true, company: true, phone: true, email: true, productInterest: true, message: true },
      labels: {
        name: 'Name',
        company: 'Company',
        phone: 'Phone',
        email: 'Email',
        productInterest: 'Product interest',
        message: 'Message',
        submit: 'Send inquiry',
      },
    },
    seo: { title: '', description: '', ogImage: '' },
  });

  await HomepageContent.create({
    hero: {
      heading: '',
      subheading: '',
      ctaPrimary: '',
      ctaSecondary: '',
      tagline: '',
    },
    heroStats: [],
    about: {
      heading: '',
      body: '',
      bullets: [],
    },
    why: [],
    industries: [],
    trustCards: [],
    coverageStates: [],
    sections: {
      hero: { visible: true, title: 'Hero', kicker: '' },
      categories: { visible: true, title: 'Product Categories', kicker: '', buttonLabel: 'View all →', buttonHref: '/products' },
      services: { visible: true, title: 'Services', kicker: '' },
      whyChoose: { visible: true, title: 'Why choose DNR', kicker: '' },
      coverage: { visible: true, title: 'Pan-India coverage', kicker: '', summaryTitle: 'Coverage network', summaryText: '' },
      industries: { visible: true, title: 'Industries & applications', kicker: '' },
      trust: { visible: true, title: 'Trusted by industry', kicker: '' },
      clients: { visible: true, title: 'Associated Brands', kicker: '' },
      featuredMachines: { visible: true, title: 'Featured Machines', kicker: '' },
      inquiry: { visible: true, title: 'Talk to an expert', kicker: 'Inquiry' },
      testimonials: { visible: true, title: 'Testimonials', kicker: '' },
    },
    featuredCategories: [],
    stats: {},
    seo: { title: '', description: '', ogImage: '' },
  });

  await Content.create({
    key: 'hero',
    data: {
      title: '',
      subtitle: '',
      cta: '',
    },
  });

  console.log('Seeded minimal CMS state');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
