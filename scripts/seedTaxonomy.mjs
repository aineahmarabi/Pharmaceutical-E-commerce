import { ConvexHttpClient } from 'convex/browser';
import dotenv from 'dotenv';
import { api } from '../convex/_generated/api.js';

dotenv.config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const CATEGORIES = [
  { name: 'Pain Relief', description: 'Tablets & topical pain solutions' },
  { name: 'Antibiotics', description: 'Prescription antibacterial medicines' },
  { name: 'Cough & Cold', description: 'Syrups, lozenges & nasal sprays' },
  { name: 'Baby Care', description: 'Formula, nutrition & baby essentials' },
  { name: 'Skin Care', description: 'Moisturizers, creams & cleansers' },
  { name: 'Arthritis & Joint Care', description: 'Joint supplements & pain relief' },
  { name: 'Sexual Wellness', description: 'Discreet prescription & supplements' },
  { name: 'Mother & Baby', description: 'Prenatal & postnatal supplements' },
  { name: 'Allergy', description: 'Antihistamines & allergy relief' },
  { name: 'Vitamins & Supplements', description: 'Daily vitamins & health boosters' },
  { name: 'Digestive Health', description: 'Antacids & digestive aids' },
  { name: 'Cardiovascular', description: 'Heart health & blood pressure' },
  { name: 'Anti-infective', description: 'Infection treatment medicines' },
  { name: 'Antimalarial', description: 'Malaria treatment & prevention' },
  { name: 'Antifungal', description: 'Topical antifungal treatments' },
  { name: 'Respiratory', description: 'Asthma & breathing support' },
];

const BRANDS = {
  Ampilin: 'Elys Chemical Industries',
  Elymox: 'Elys Chemical Industries',
  Altem: 'Elys Chemical Industries',
  Alugel: 'Elys Chemical Industries',
  Candistat: 'Elys Chemical Industries',
  Chestcof: 'Elys Chemical Industries',
  Ventosal: 'Elys Chemical Industries',
  Elys: 'Elys Chemical Industries',
  'Cardi-80': 'Elys Chemical Industries',
  Alprim: 'Elys Chemical Industries',
  Tidazol: 'Elys Chemical Industries',
  'Elys Vitamin C': 'Elys Chemical Industries',
  'Elys Aspirin': 'Elys Chemical Industries',
  Panadol: 'Haleon',
  Brufen: 'Abbott',
  Advil: 'Haleon',
  'Bayer Aspirin': 'Bayer',
  Benylin: 'Kenvue',
  Strepsils: 'Reckitt',
  Otrivin: 'Haleon',
  Piriton: 'Haleon',
  Zyrtec: 'Kenvue',
  Voltaren: 'Haleon',
  Celebrex: 'Pfizer',
  Arcoxia: 'MSD',
  'Move Free': 'Schiff',
  'Seven Seas': 'Seven Seas',
  Viagra: 'Pfizer',
  Cialis: 'Eli Lilly',
  Levitra: 'Bayer',
  "Nature's Bounty": "Nature's Bounty",
  NAN: 'Nestlé',
  Aptamil: 'Danone',
  SMA: 'SMA',
  Cerelac: 'Nestlé',
  Wellbaby: 'Vitabiotics',
  "Johnson's": 'Kenvue',
  Sebamed: 'Sebapharma',
  Pregnacare: 'Vitabiotics',
  Cetaphil: 'Galderma',
  CeraVe: 'CeraVe',
  E45: 'Karo',
  Nivea: 'Beiersdorf',
  Dove: 'Unilever',
};

async function seedCategories() {
  const existing = await client.query(api.taxonomy.listCategories, {});
  const existingSlugs = new Set(existing.map((c) => c.slug));

  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    if (existingSlugs.has(slug)) {
      console.log(`↷ Category exists, skipping: ${cat.name}`);
      continue;
    }
    await client.mutation(api.taxonomy.createCategory, {
      name: cat.name,
      description: cat.description,
    });
    console.log(`✅ Category: ${cat.name} (${slug})`);
  }
}

async function seedBrands() {
  const existing = await client.query(api.brands.list, {});
  const existingSlugs = new Set(existing.map((b) => b.slug));

  for (const [name, manufacturer] of Object.entries(BRANDS)) {
    const slug = slugify(name);
    if (existingSlugs.has(slug)) {
      console.log(`↷ Brand exists, skipping: ${name}`);
      continue;
    }
    await client.mutation(api.brands.create, {
      name,
      slug,
      description: manufacturer,
    });
    console.log(`✅ Brand: ${name} (${slug})`);
  }
}

async function run() {
  console.log('Seeding categories...');
  await seedCategories();
  console.log('Seeding brands...');
  await seedBrands();
  console.log('Taxonomy seed complete.');
}

run();
