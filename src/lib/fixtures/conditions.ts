import type { Condition } from './types';
import { CDN } from '@/lib/images';

export const conditions: Condition[] = [
  { id: 'cond-headache', name: 'Headaches & Migraines', slug: 'headaches-migraines', description: 'Fast relief for tension headaches, migraines, and cluster headaches.', productCount: 5, image: CDN.categories.painRelief },
  { id: 'cond-cough', name: 'Cough & Sore Throat', slug: 'cough-sore-throat', description: 'Lozenges, syrups, and sprays to soothe irritated throats and calm coughs.', productCount: 4, image: CDN.categories.coldFlu },
  { id: 'cond-immune', name: 'Immune Support', slug: 'immune-support', description: 'Vitamins, minerals, and supplements to keep your immune system strong.', productCount: 5, image: CDN.categories.vitamins },
  { id: 'cond-acne', name: 'Acne & Skin Issues', slug: 'acne-skin-issues', description: 'Dermatologist-recommended products for clearer, healthier skin.', productCount: 6, image: CDN.categories.skincare },
  { id: 'cond-allergy', name: 'Allergies & Hayfever', slug: 'allergies-hayfever', description: 'Antihistamines and nasal sprays for relief from seasonal allergies.', productCount: 3, image: CDN.conditions.allergies },
  { id: 'cond-blood-sugar', name: 'Blood Sugar Management', slug: 'blood-sugar', description: 'Medications, monitors, and lifestyle products for managing blood glucose.', productCount: 3, image: CDN.categories.diabetes },
  { id: 'cond-heart', name: 'Heart Health', slug: 'heart-health', description: 'Omega-3, aspirin, and supplements to support cardiovascular health.', productCount: 3, image: CDN.conditions.heartHealth },
  { id: 'cond-joints', name: 'Joint & Muscle Pain', slug: 'joint-muscle-pain', description: 'Anti-inflammatories, gels, and supplements for joint and muscle relief.', productCount: 4, image: CDN.conditions.joints },
  { id: 'cond-sleep', name: 'Sleep & Relaxation', slug: 'sleep-relaxation', description: 'Natural and pharmaceutical sleep aids for a restful night.', productCount: 2, image: CDN.conditions.sleep },
  { id: 'cond-womens', name: "Women's Health", slug: 'womens-health', description: 'Vitamins, supplements, and personal care tailored for women.', productCount: 3, image: CDN.categories.babyMum },
];
