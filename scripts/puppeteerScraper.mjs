import puppeteer from 'puppeteer';
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";

dotenv.config({ path: ".env.local" });
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const CATEGORIES = [
  'prescription-medications-1',
  'over-the-counter-1',
  'supplements',
  'personal-care'
];

const BASE_URL = 'https://shop.pharmaplus.co.ke';

async function scrapeCategory(page, categorySlug) {
  console.log(`Scraping ${categorySlug}...`);
  await page.goto(`${BASE_URL}/products/category/${categorySlug}`, { waitUntil: 'networkidle2' });

  // Scroll to bottom to trigger lazy loads
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 200;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // Extract products
  const products = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('a[href^="/products/"]');
    
    elements.forEach(el => {
      if(el.href.includes('/category/') || el.href.includes('/collection/')) return;

      const img = el.querySelector('img');
      const imageUrl = img ? img.src : null;
      
      const text = el.innerText;
      let name = null;
      let price = null;
      
      if (text) {
        const lines = text.split('\n');
        for (const line of lines) {
           if (line.includes('Ksh') || line.includes('KES')) {
               price = parseInt(line.replace(/[^0-9]/g, ''), 10);
           } else if (line.trim().length > 3 && !name && !line.includes('Off') && !line.includes('New')) {
               name = line.trim();
           }
        }
      }
      
      if (name && imageUrl && !items.find(i => i.name === name)) {
        items.push({
           name,
           slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
           price: price || 0,
           imageUrl
        });
      }
    });
    return items;
  });

  console.log(`Found ${products.length} products in ${categorySlug}`);
  
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
      console.error(`❌ Failed to insert ${p.name}`);
    }
  }
}

async function run() {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  for (const cat of CATEGORIES) {
    await scrapeCategory(page, cat);
  }
  
  await browser.close();
  console.log("Migration Complete!");
}

run();
