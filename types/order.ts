import type { CartItem } from '@/types/cart';

export type ShippingMethod = 'standard' | 'express';

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface OrderDraft {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  currency: 'KES';
  subtotal: number; // KES
  tax: number; // KES
  taxRate: number; // e.g., 0.16
  shipping: number; // KES
  shippingMethod: ShippingMethod;
  pointsDiscount?: number; // KES discount from redeemed points
  pointsRedeemed?: number; // number of points used
  total: number; // KES (after all discounts)
  address?: Address;
  status: 'pending_payment' | 'failed' | 'expired';
  createdAt: number;
  paymentProvider: 'stripe';
}

export type OrderStatus = 
  | 'paid' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded' 
  | 'return_requested' 
  | 'return_approved' 
  | 'return_denied';

export interface Order extends Omit<OrderDraft, 'status'> {
  status: OrderStatus;
  paymentIntentId: string;
  events: Array<{ type: string; at: number; data?: any }>; // audit log
  trackingNumber?: string;
  refundedAmount?: number;
  pointsEarned?: number; // points credited after order completion
}
