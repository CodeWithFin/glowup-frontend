export interface CartItem {
  id: string; // cart item id
  productId: string;
  title: string;
  price: number; // KES integer
  imageUrl?: string;
  quantity: number; // >= 1
  variantId?: string; // future proofing
  addedAt: number; // epoch ms
}

export interface Cart {
  id: string; // cart key (user:{id} or session:{id})
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  currency: 'KES';
  subtotal: number; // computed
  updatedAt: number; // epoch ms
}

export interface AddCartItemInput {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity?: number;
  variantId?: string;
}

export interface UpdateCartItemInput {
  id: string; // cart item id
  quantity?: number; // set absolute, remove if < 1
}

export type Identity = { userId?: string; sessionId?: string };

export const CART_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
