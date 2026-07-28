"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  storefront: "housecam" | "housepet";
  purchaseMode: "unit" | "pack10";
  quantity: number;
  unitPriceCents: number;
  imageUrl: string | null;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, purchaseMode: CartItem["purchaseMode"], quantity: number) => void;
  removeItem: (productId: string, purchaseMode: CartItem["purchaseMode"]) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((candidate) =>
          candidate.productId === item.productId && candidate.purchaseMode === item.purchaseMode);
        return {
          items: existing
            ? state.items.map((candidate) => candidate === existing
              ? { ...candidate, quantity: candidate.quantity + item.quantity }
              : candidate)
            : [...state.items, item],
        };
      }),
      setQuantity: (productId, purchaseMode, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter((item) => item.productId !== productId || item.purchaseMode !== purchaseMode)
          : state.items.map((item) => item.productId === productId && item.purchaseMode === purchaseMode
            ? { ...item, quantity }
            : item),
      })),
      removeItem: (productId, purchaseMode) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId || item.purchaseMode !== purchaseMode),
      })),
      clear: () => set({ items: [] }),
    }),
    { name: "housecam-cart" },
  ),
);
