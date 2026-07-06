import axios from 'axios';
import * as cheerio from 'cheerio';
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// A list of some main categories from pharmaplus
const CATEGORIES = [
  'prescription-medications-1',
  'over-the-counter-1',
  'supplements',
  'personal-care'
];

const BASE_URL = 'https://shop.pharmaplus.co.ke';

async function extractNextData(html) {
  // Simple regex to extract JSON-like structures that contain product data
  const regex = /"name":"([^"]+)","slug":"([^"]+)".*?"price":(\d+).*?"imageUrl":"([^"]+)"/g;
  let matches;
  const products = [];
  const seen = new Set();
  
  while ((matches = regex.exec(html)) !== null) {
    if (!seen.has(matches[2])) {
      seen.add(matches[2]);
      products.push({
        name: matches[1],
        slug: matches[2],
        price: parseInt(matches[3]),
        imageUrl: matches[4].startsWith('http') ? matches[4] : `${BASE_URL}${matches[4]}`
      });
    }
  }
  return products;
}

async function scrapeCategory(categorySlug) {
  console.log(`Scraping category: ${categorySlug}...`);
  try {
    const { data } = await axios.get(`${BASE_URL}/products/category/${categorySlug}`);
    
    // We parse the raw HTML to extract product definitions from Next.js payload
    const products = await extractNextData(data);
    console.log(`Found ${products.length} products in ${categorySlug}`);
    
    // Save to Convex
    for (const p of products) {
      try {
        await client.mutation(api.products.create, {
          name: p.name,
          slug: p.slug,
          price: p.price,
          category: categorySlug,
          categorySlug: categorySlug,
          brand: 'PharmaPlus',
          brandSlug: 'pharmaplus',
          genericName: p.name,
          classification: 'OTC',
          form: 'Tablets',
          strength: 'Standard',
          packSize: '1 Pack',
          description: `Imported from Pharmaplus: ${p.name}`,
          directions: 'Use as directed',
          warnings: 'Keep out of reach of children',
          ingredients: 'Standard ingredients',
          imageUrl: p.imageUrl,
          inStock: true,
          stockQty: 100,
        });
        console.log(`✅ Inserted: ${p.name}`);
      } catch (err) {
        console.error(`❌ Failed to insert ${p.name}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error(`Failed to scrape ${categorySlug}:`, error.message);
  }
}

async function run() {
  console.log("Starting PharmaPlus Data Migration...");
  for (const cat of CATEGORIES) {
    await scrapeCategory(cat);
  }
  console.log("Migration Complete! All products are now in your database and editable in the Admin Panel.");
}

run();
