import type { Category } from './types';
import { CDN } from '@/lib/images';

export const categories: Category[] = [
  { id: 'cat-pain', name: 'Pain & Fever', slug: 'pain-fever', description: 'Paracetamol, ibuprofen, aspirin, and more for pain relief and fever reduction.', productCount: 6, image: CDN.categories.painRelief },
  { id: 'cat-cold', name: 'Cold & Flu', slug: 'cold-flu', description: 'Cough syrups, lozenges, decongestants, and throat remedies.', productCount: 4, image: CDN.categories.coldFlu },
  { id: 'cat-vitamins', name: 'Vitamins & Supplements', slug: 'vitamins', description: 'Multivitamins, omega-3, vitamin C, zinc, and wellness supplements.', productCount: 5, image: CDN.categories.vitamins },
  { id: 'cat-skin', name: 'Skincare & Beauty', slug: 'skincare', description: 'Moisturisers, cleansers, sunscreen, and therapeutic skincare.', productCount: 5, image: CDN.categories.skincare },
  { id: 'cat-baby', name: 'Baby & Mum', slug: 'baby-mum', description: 'Baby care, pregnancy vitamins, and maternal wellness products.', productCount: 3, image: CDN.categories.babyMum },
  { id: 'cat-digestive', name: 'Digestive Health', slug: 'digestive', description: 'Antacids, laxatives, probiotics, and digestive enzymes.', productCount: 4, image: CDN.categories.digestive },
  { id: 'cat-diabetes', name: 'Diabetes Care', slug: 'diabetes', description: 'Blood glucose monitors, test strips, insulin supplies, and diabetes medication.', productCount: 3, image: CDN.categories.diabetes },
  { id: 'cat-personal', name: 'Personal Care', slug: 'personal-care', description: 'Shampoos, antiseptics, sleep aids, and everyday personal care.', productCount: 4, image: CDN.categories.personalCare },
];

export const brands = [
  { id: 'br-panadol', name: 'Panadol', slug: 'panadol', productCount: 2 },
  { id: 'br-hedex', name: 'Hedex', slug: 'hedex', productCount: 1 },
  { id: 'br-brufen', name: 'Brufen', slug: 'brufen', productCount: 1 },
  { id: 'br-actifed', name: 'Actifed', slug: 'actifed', productCount: 1 },
  { id: 'br-strepsils', name: 'Strepsils', slug: 'strepsils', productCount: 1 },
  { id: 'br-centrum', name: 'Centrum', slug: 'centrum', productCount: 3 },
  { id: 'br-cerave', name: 'CeraVe', slug: 'cerave', productCount: 1 },
  { id: 'br-cetaphil', name: 'Cetaphil', slug: 'cetaphil', productCount: 2 },
  { id: 'br-johnsons', name: "Johnson's", slug: 'johnsons', productCount: 1 },
  { id: 'br-gaviscon', name: 'Gaviscon', slug: 'gaviscon', productCount: 2 },
  { id: 'br-canesten', name: 'Canesten', slug: 'canesten', productCount: 1 },
  { id: 'br-gsk', name: 'GSK', slug: 'gsk', productCount: 8 },
];
