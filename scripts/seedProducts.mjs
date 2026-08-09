import { ConvexHttpClient } from 'convex/browser';
import dotenv from 'dotenv';
import { api } from '../convex/_generated/api.js';

dotenv.config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const CATEGORY_NAMES = {
  'pain-relief': 'Pain Relief',
  antibiotics: 'Antibiotics',
  'cough-cold': 'Cough & Cold',
  'baby-care': 'Baby Care',
  'skin-care': 'Skin Care',
  'arthritis-joint-care': 'Arthritis & Joint Care',
  'sexual-wellness': 'Sexual Wellness',
  'mother-baby': 'Mother & Baby',
  allergy: 'Allergy',
  'vitamins-supplements': 'Vitamins & Supplements',
  'digestive-health': 'Digestive Health',
  cardiovascular: 'Cardiovascular',
  'anti-infective': 'Anti-infective',
  antimalarial: 'Antimalarial',
  antifungal: 'Antifungal',
  respiratory: 'Respiratory',
};

// sku, categorySlug, name, brand, manufacturer, generic, strength, packSize, cost, sellingPrice, badge, rating, reviewCount, description, rx
const PRODUCTS = [
  ['EL001', 'antibiotics', 'Ampilin Capsules', 'Ampilin', 'Elys Chemical Industries', 'Ampicillin', '500 mg', "100's", 850, 1105, 'prescription', 4.6, 128, 'Broad-spectrum antibiotic for bacterial infections. Each capsule contains 500mg Ampicillin.', true],
  ['EL002', 'antibiotics', 'Ampilin Suspension', 'Ampilin', 'Elys Chemical Industries', 'Ampicillin', '125 mg/5 mL', '100 mL', 480, 624, 'prescription', 4.5, 89, 'Oral suspension antibiotic suitable for children. Ampicillin 125mg per 5mL dose.', true],
  ['EL003', 'antibiotics', 'Elymox Capsules', 'Elymox', 'Elys Chemical Industries', 'Amoxicillin', '500 mg', "100's", 950, 1235, 'bestseller', 4.8, 342, 'Premium amoxicillin capsules for treating a wide range of bacterial infections.', true],
  ['EL004', 'antibiotics', 'Elymox Suspension', 'Elymox', 'Elys Chemical Industries', 'Amoxicillin', '125 mg/5 mL', '100 mL', 520, 676, null, 4.7, 156, 'Paediatric amoxicillin suspension for treating infections in children.', true],
  ['EL005', 'antimalarial', 'Altem Tablets', 'Altem', 'Elys Chemical Industries', 'Artemether/Lumefantrine', '20/120 mg', "24's", 480, 624, 'bestseller', 4.9, 567, 'First-line antimalarial combination therapy. Artemether 20mg/Lumefantrine 120mg.', true],
  ['EL006', 'digestive-health', 'Alugel Suspension', 'Alugel', 'Elys Chemical Industries', 'Antacid', null, '200 mL', 380, 494, null, 4.4, 201, 'Fast-acting antacid suspension for heartburn and indigestion relief.', false],
  ['EL007', 'antifungal', 'Candistat Cream', 'Candistat', 'Elys Chemical Industries', 'Clotrimazole', '1%', '20 g', 420, 546, null, 4.5, 178, "Topical antifungal cream for skin fungal infections including athlete's foot and ringworm.", false],
  ['EL008', 'cough-cold', 'Chestcof Syrup', 'Chestcof', 'Elys Chemical Industries', null, null, '100 mL', 320, 416, 'sale', 4.3, 245, 'Effective cough syrup for dry and productive coughs. Soothes throat irritation.', false],
  ['EL009', 'respiratory', 'Ventosal Syrup', 'Ventosal', 'Elys Chemical Industries', 'Salbutamol', '2 mg/5 mL', '100 mL', 290, 377, 'prescription', 4.6, 134, 'Bronchodilator syrup for asthma and respiratory conditions. Salbutamol 2mg/5mL.', true],
  ['EL010', 'pain-relief', 'Paracetamol Tablets', 'Elys', 'Elys Chemical Industries', 'Paracetamol', '500 mg', "100's", 180, 234, 'bestseller', 4.7, 892, 'Trusted paracetamol tablets for pain and fever relief. 500mg per tablet.', false],
  ['EL011', 'cardiovascular', 'Cardi-80 Tablets', 'Cardi-80', 'Elys Chemical Industries', 'Aspirin', '80 mg', "30's", 240, 312, null, 4.5, 167, 'Low-dose aspirin for cardiovascular protection. 80mg enteric-coated tablets.', false],
  ['EL012', 'anti-infective', 'Alprim Tablets', 'Alprim', 'Elys Chemical Industries', 'Co-trimoxazole', '960 mg', "20's", 340, 442, 'prescription', 4.4, 98, 'Broad-spectrum anti-infective combination for bacterial infections.', true],
  ['EL013', 'anti-infective', 'Tidazol Tablets', 'Tidazol', 'Elys Chemical Industries', 'Metronidazole', '400 mg', "21's", 300, 390, null, 4.3, 145, 'Antiprotozoal and antibacterial for treating various infections.', true],
  ['EL014', 'vitamins-supplements', 'Vitamin C Tablets', 'Elys Vitamin C', 'Elys Chemical Industries', 'Ascorbic Acid', '100 mg', "100's", 260, 338, 'new', 4.6, 312, 'Essential vitamin C supplement for immune support. 100mg per tablet.', false],
  ['EL015', 'pain-relief', 'Aspirin Tablets', 'Elys Aspirin', 'Elys Chemical Industries', 'Aspirin', '300 mg', "100's", 220, 286, null, 4.4, 234, 'Analgesic and anti-inflammatory tablets for pain, fever, and inflammation.', false],
  ['OT001', 'pain-relief', 'Panadol Tablets', 'Panadol', 'Haleon', 'Paracetamol', '500 mg', "20's", 180, 234, 'bestseller', 4.9, 1245, "Kenya's most trusted paracetamol brand for effective pain and fever relief.", false],
  ['OT002', 'pain-relief', 'Panadol Extra', 'Panadol', 'Haleon', 'Paracetamol/Caffeine', null, "24's", 320, 416, 'bestseller', 4.8, 876, 'Enhanced formula with caffeine for stronger pain relief action.', false],
  ['OT003', 'pain-relief', 'Brufen Tablets', 'Brufen', 'Abbott', 'Ibuprofen', '400 mg', "30's", 480, 624, null, 4.7, 534, 'Anti-inflammatory pain relief tablets. Ibuprofen 400mg.', false],
  ['OT004', 'pain-relief', 'Advil Tablets', 'Advil', 'Haleon', 'Ibuprofen', '200 mg', "24's", 420, 546, null, 4.6, 389, 'Fast-acting ibuprofen for pain, headache, and inflammation relief.', false],
  ['OT005', 'pain-relief', 'Bayer Aspirin', 'Bayer Aspirin', 'Bayer', 'Aspirin', '300 mg', "100's", 380, 494, null, 4.5, 267, 'Premium aspirin for pain relief and cardiovascular health.', false],
  ['OT006', 'cough-cold', 'Benylin Syrup', 'Benylin', 'Kenvue', null, null, '100 mL', 450, 585, 'bestseller', 4.7, 678, 'Trusted cough syrup for dry and chesty coughs.', false],
  ['OT007', 'cough-cold', 'Strepsils Lozenges', 'Strepsils', 'Reckitt', null, null, "24's", 350, 455, 'bestseller', 4.6, 543, 'Sore throat lozenges with antibacterial action for fast relief.', false],
  ['OT008', 'cough-cold', 'Otrivin Nasal Spray', 'Otrivin', 'Haleon', 'Xylometazoline', '0.1%', '10 mL', 680, 884, null, 4.5, 234, 'Fast-acting nasal decongestant spray for blocked nose relief.', false],
  ['OT009', 'allergy', 'Piriton Tablets', 'Piriton', 'Haleon', 'Chlorphenamine', '4 mg', "30's", 260, 338, 'bestseller', 4.5, 456, 'Antihistamine tablets for hay fever and allergy symptom relief.', false],
  ['OT010', 'allergy', 'Zyrtec Tablets', 'Zyrtec', 'Kenvue', 'Cetirizine', '10 mg', "20's", 350, 455, null, 4.7, 312, 'Non-drowsy antihistamine for 24-hour allergy relief.', false],
  ['AR001', 'arthritis-joint-care', 'Voltaren Emulgel', 'Voltaren', 'Haleon', 'Diclofenac', '1%', '50 g', 1250, 1625, 'bestseller', 4.8, 723, 'Topical anti-inflammatory gel for joint and muscle pain relief.', false],
  ['AR002', 'arthritis-joint-care', 'Celebrex Capsules', 'Celebrex', 'Pfizer', 'Celecoxib', '200 mg', "30's", 2350, 3055, 'prescription', 4.7, 234, 'Prescription NSAID for arthritis pain and inflammation management.', true],
  ['AR003', 'arthritis-joint-care', 'Arcoxia Tablets', 'Arcoxia', 'MSD', 'Etoricoxib', '90 mg', "30's", 2800, 3640, 'prescription', 4.6, 189, 'Selective COX-2 inhibitor for arthritis and acute pain management.', true],
  ['AR004', 'arthritis-joint-care', 'Move Free Advanced', 'Move Free', 'Schiff', 'Glucosamine', null, '60 tabs', 3200, 4160, 'new', 4.5, 156, 'Advanced joint supplement with glucosamine for joint mobility and comfort.', false],
  ['AR005', 'arthritis-joint-care', 'JointCare Capsules', 'Seven Seas', 'Seven Seas', null, null, "30's", 2100, 2730, null, 4.4, 198, 'Complete joint care formula with essential nutrients for healthy joints.', false],
  ['LB001', 'sexual-wellness', 'Viagra Tablets', 'Viagra', 'Pfizer', 'Sildenafil', '50 mg', "4's", 2500, 3250, 'prescription', 4.8, 567, 'Prescription medication for erectile dysfunction. Discreet packaging guaranteed.', true],
  ['LB002', 'sexual-wellness', 'Cialis Tablets', 'Cialis', 'Eli Lilly', 'Tadalafil', '20 mg', "4's", 3200, 4160, 'prescription', 4.9, 445, 'Long-acting ED medication with up to 36-hour effectiveness. Discreet delivery.', true],
  ['LB003', 'sexual-wellness', 'Levitra Tablets', 'Levitra', 'Bayer', 'Vardenafil', '20 mg', "4's", 2800, 3640, 'prescription', 4.7, 234, 'Fast-acting ED treatment option. Prescription required.', true],
  ['LB004', 'sexual-wellness', 'Maca Capsules', "Nature's Bounty", "Nature's Bounty", 'Maca', '500 mg', '60 caps', 1800, 2340, 'new', 4.5, 312, 'Natural maca root supplement for energy, stamina, and vitality.', false],
  ['LB005', 'sexual-wellness', 'Ginseng Capsules', "Nature's Bounty", "Nature's Bounty", 'Ginseng', '1000 mg', '60 caps', 1600, 2080, null, 4.4, 267, 'Premium Korean ginseng for energy, focus, and overall wellness.', false],
  ['BB001', 'baby-care', 'NAN 1 Infant Formula', 'NAN', 'Nestlé', null, 'Stage 1', '400 g', 1650, 2145, 'bestseller', 4.8, 456, 'Premium infant formula for 0-6 months. Enriched with essential nutrients.', false],
  ['BB002', 'baby-care', 'Aptamil 1 Infant Formula', 'Aptamil', 'Danone', null, 'Stage 1', '400 g', 1850, 2405, null, 4.7, 345, 'Advanced infant formula with patented nutrient blend for healthy development.', false],
  ['BB003', 'baby-care', 'SMA 1 Infant Formula', 'SMA', 'SMA', null, 'Stage 1', '400 g', 1750, 2275, null, 4.6, 234, 'Trusted infant formula with balanced nutrition for growing babies.', false],
  ['BB004', 'baby-care', 'Cerelac Wheat', 'Cerelac', 'Nestlé', null, '400 g', '400 g', 780, 1014, 'bestseller', 4.8, 678, 'Nutritious wheat-based cereal for babies from 6 months.', false],
  ['BB005', 'baby-care', 'Wellbaby Drops', 'Wellbaby', 'Vitabiotics', null, '30 mL', '30 mL', 650, 845, 'new', 4.7, 198, 'Essential vitamin drops for babies and infants. Supports healthy growth.', false],
  ['BB006', 'baby-care', 'Seven Seas Baby Syrup', 'Seven Seas', 'Seven Seas', null, '100 mL', '100 mL', 780, 1014, null, 4.5, 167, 'Cod liver oil syrup with vitamins for healthy baby development.', false],
  ['BB007', 'baby-care', "Johnson's Baby Lotion", "Johnson's", 'Kenvue', null, '200 mL', '200 mL', 550, 715, 'bestseller', 4.6, 534, "Gentle moisturizing lotion specially formulated for baby's delicate skin.", false],
  ['BB008', 'baby-care', 'Sebamed Baby Lotion', 'Sebamed', 'Sebapharma', null, '200 mL', '200 mL', 1650, 2145, null, 4.8, 189, 'pH 5.5 dermatologist-recommended baby lotion for sensitive skin.', false],
  ['BB009', 'mother-baby', 'Pregnacare Original', 'Pregnacare', 'Vitabiotics', null, '30 tabs', '30 tabs', 1450, 1885, 'bestseller', 4.9, 567, "UK's No.1 pregnancy supplement with folic acid, iron, and 17 essential nutrients.", false],
  ['BB010', 'mother-baby', 'Pregnacare Breastfeeding', 'Pregnacare', 'Vitabiotics', null, '28 tabs', '28 tabs', 1650, 2145, 'new', 4.8, 234, 'Comprehensive postnatal supplement supporting breastfeeding mothers.', false],
  ['SC001', 'skin-care', 'Cetaphil Moisturizing Lotion', 'Cetaphil', 'Galderma', null, '236 mL', '236 mL', 2100, 2730, 'bestseller', 4.8, 456, 'Dermatologist recommended gentle moisturizer for all skin types.', false],
  ['SC002', 'skin-care', 'CeraVe Moisturizing Cream', 'CeraVe', 'CeraVe', null, '340 g', '340 g', 2800, 3640, 'bestseller', 4.9, 678, 'Rich moisturizing cream with ceramides and hyaluronic acid. Non-comedogenic.', false],
  ['SC003', 'skin-care', 'E45 Moisturising Cream', 'E45', 'Karo', null, '125 g', '125 g', 1200, 1560, null, 4.6, 345, 'Clinically proven moisturizer for dry and sensitive skin conditions.', false],
  ['SC004', 'skin-care', 'Nivea Soft Cream', 'Nivea', 'Beiersdorf', null, '200 mL', '200 mL', 680, 884, null, 4.5, 567, 'Refreshingly soft moisturizing cream for face, hands, and body.', false],
  ['SC005', 'skin-care', 'Dove Beauty Bar', 'Dove', 'Unilever', null, '100 g', '100 g', 250, 325, 'bestseller', 4.7, 892, "Gentle cleansing bar with 1/4 moisturizing cream. Won't dry skin like soap.", false],
];

function deriveForm(name) {
  const n = name.toLowerCase();
  if (n.includes('capsule')) return 'Capsule';
  if (n.includes('suspension')) return 'Suspension';
  if (n.includes('tablet')) return 'Tablet';
  if (n.includes('emulgel') || n.includes('gel')) return 'Gel';
  if (n.includes('cream') || n.includes('lotion')) return 'Cream';
  if (n.includes('syrup')) return 'Syrup';
  if (n.includes('spray')) return 'Spray';
  if (n.includes('drops')) return 'Drops';
  if (n.includes('lozenge')) return 'Lozenge';
  if (n.includes('bar')) return 'Bar';
  if (n.includes('formula') || n.includes('wheat')) return 'Powder';
  return 'Other';
}

function directionsFor(rx, generic) {
  if (rx) return 'Take strictly as directed by your pharmacist or physician. Do not exceed the prescribed dose.';
  return `Follow the dosage instructions on the pack${generic ? `, or as advised by your pharmacist` : ''}.`;
}

function warningsFor(rx) {
  return rx
    ? 'Prescription-only medicine. Keep out of reach of children. Inform your pharmacist of any other medication you are taking.'
    : 'Keep out of reach of children. Do not exceed the stated dose. Consult a doctor if symptoms persist.';
}

function ingredientsFor(generic) {
  return generic ? generic : 'See product packaging for the full ingredient listing.';
}

async function seedProducts() {
  let created = 0;
  let skipped = 0;

  for (const row of PRODUCTS) {
    const [
      sku, categorySlug, name, brand, manufacturer, generic, strength, packSize,
      cost, sellingPrice, badge, rating, reviewCount, description, rx,
    ] = row;

    const slug = slugify(name);
    const brandSlug = slugify(brand);
    const classification = rx ? 'POM' : 'OTC';
    const isNew = badge === 'new';
    const isBestSeller = badge === 'bestseller';
    const isOffer = badge === 'sale';
    const isTrending = rating >= 4.7;

    try {
      await client.mutation(api.products.upsertProduct, {
        slug,
        name,
        brand,
        brandSlug,
        genericName: generic ?? '',
        category: CATEGORY_NAMES[categorySlug] ?? categorySlug,
        categorySlug,
        conditions: [],
        classification,
        form: deriveForm(name),
        strength: strength ?? 'N/A',
        packSize,
        price: sellingPrice,
        compareAtPrice: isOffer ? Math.round(sellingPrice * 1.15) : undefined,
        description,
        directions: directionsFor(rx, generic),
        warnings: warningsFor(rx),
        ingredients: ingredientsFor(generic),
        inStock: true,
        stockQty: 40 + Math.floor(Math.random() * 210),
        sku,
        manufacturer,
        isNew,
        isTrending,
        isBestSeller,
        isOffer,
        rating,
        reviewCount,
      });
      created += 1;
      console.log(`✅ ${name} (${slug})`);
    } catch (err) {
      skipped += 1;
      console.error(`❌ Failed: ${name} — ${err.message}`);
    }
  }

  console.log(`\nDone. ${created} products upserted, ${skipped} failed.`);
}

seedProducts();
