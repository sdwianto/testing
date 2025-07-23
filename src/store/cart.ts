// src/store/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type AddToCartItem = Omit<CartItem, "quantity">;

interface CartState {
  items: CartItem[];
  addToCart: (newItem: AddToCartItem) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (newItem) => {
        const { items } = get();

        const existingItemIndex = items.findIndex(
          (item) => item.productId === newItem.productId
        );

        let updatedItems: CartItem[];

        if (existingItemIndex === -1) {
          // Item baru → tambahkan dengan quantity 1
          updatedItems = [
            ...items,
            { ...newItem, quantity: 1 },
          ];
        } else {
          // Item sudah ada → update quantity
          updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        set({ items: updatedItems });
      },

      increaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      },

      decreaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // key untuk localStorage
    }
  )
);
