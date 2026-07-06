import axios from 'axios';
import * as cheerio from 'cheerio';

async function run() {
  try {
    const { data } = await axios.get('https://shop.pharmaplus.co.ke/products/category/prescription-medications-1');
    const $ = cheerio.load(data);
    
    // Attempt to find NEXT_DATA or trpc data
    const scriptTags = $('script').toArray();
    let foundData = false;
    
    for (const script of scriptTags) {
      const html = $(script).html();
      if (html && html.includes('self.__next_f.push')) {
        // Find line containing product data
        if (html.includes('products')) {
          console.log("Found product data in __next_f!");
          foundData = true;
          // Print a snippet of it
          const idx = html.indexOf('products');
          console.log(html.substring(Math.max(0, idx - 100), idx + 200));
          break;
        }
      }
    }
    
    if (!foundData) {
      console.log("Could not find product data in script tags. Trying standard HTML.");
      const products = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/products/') && !href.includes('category') && !href.includes('collection')) {
           products.push(href);
        }
      });
      console.log("Found product links: ", products.slice(0, 5));
    }

  } catch (error) {
    console.error("Error fetching", error.message);
  }
}
run();
