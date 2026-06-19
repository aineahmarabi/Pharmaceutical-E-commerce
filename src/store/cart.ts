import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/fixtures/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

interface WishlistStore {
  ids: Set<string>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      get itemCount() {
        return get().items.reduce((n, i) => n + i.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce((s, i) => s + i.product.price * i.quantity, 0);
      },
      addItem(product) {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        });
      },
      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },
      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart() {
        set({ items: [] });
      },
    }),
    { name: 'pharmacare-cart' }
  )
);

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: new Set<string>(),
      toggle(id) {
        set((state) => {
          const next = new Set(state.ids);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { ids: next };
        });
      },
      has(id) {
        return get().ids.has(id);
      },
    }),
    {
      name: 'pharmacare-wishlist',
      storage: {
        getItem(name) {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return { ...parsed, state: { ...parsed.state, ids: new Set(parsed.state.ids ?? []) } };
        },
        setItem(name, value) {
          const toStore = { ...value, state: { ...value.state, ids: [...value.state.ids] } };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem(name) {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
