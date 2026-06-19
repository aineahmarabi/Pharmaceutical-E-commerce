export type ProductClass = 'OTC' | 'P' | 'POM';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  genericName: string;
  category: string;
  categorySlug: string;
  conditions: string[];
  classification: ProductClass;
  form: string;
  strength: string;
  packSize: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  directions: string;
  warnings: string;
  ingredients: string;
  inStock: boolean;
  stockQty: number;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isOffer?: boolean;
  ageRestricted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
}

export interface Condition {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'placed' | 'confirmed' | 'packed' | 'delivering' | 'completed' | 'cancelled';
  paymentMethod: 'mpesa' | 'card' | 'cod';
  paymentRef?: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}
