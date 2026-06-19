export const CDN = {
  hero: {
    bg: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1920&q=80',
    secondary: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
  },
  categories: {
    painRelief: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&q=80',
    vitamins: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    skincare: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&q=80',
    babyMum: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
    coldFlu: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&q=80',
    diabetes: 'https://images.unsplash.com/photo-1593491034932-844ab981ed7c?w=600&q=80',
    personalCare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    digestive: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
  },
  conditions: {
    heartHealth: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=600&q=80',
    allergies: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    chronicCare: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80',
    vitamins: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    sleep: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80',
    joints: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  },
  banners: {
    offer1: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1200&q=80',
    offer2: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1200&q=80',
    wellness: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80',
  },
  trust: {
    pharmacist: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&q=80',
    lab: 'https://images.unsplash.com/photo-1579165466741-7f35e4755182?w=600&q=80',
  },
  about: {
    team: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    pharmacy: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
  },
} as const;

export const cdnImages = {
  hero: { main: CDN.hero.bg, secondary: CDN.hero.secondary },
  categories: {
    'pain-fever': CDN.categories.painRelief,
    vitamins: CDN.categories.vitamins,
    skincare: CDN.categories.skincare,
    'baby-mum': CDN.categories.babyMum,
    'cold-flu': CDN.categories.coldFlu,
    diabetes: CDN.categories.diabetes,
    'personal-care': CDN.categories.personalCare,
    digestive: CDN.categories.digestive,
  } as Record<string, string>,
  conditions: {
    'heart-health': CDN.conditions.heartHealth,
    allergies: CDN.conditions.allergies,
    'chronic-care': CDN.conditions.chronicCare,
    vitamins: CDN.conditions.vitamins,
    sleep: CDN.conditions.sleep,
    joints: CDN.conditions.joints,
  } as Record<string, string>,
  about: {
    team: CDN.about.team,
    pharmacist: CDN.trust.pharmacist,
    store: CDN.about.pharmacy,
  },
};
