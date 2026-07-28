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
    }),
    { name: "housecam-cart" },
  ),
);
