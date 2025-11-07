import type { CartItem } from '@/types/cart';
import type { ShippingMethod } from '@/types/order';

interface TotalsInput {
  items: CartItem[];
  shippingMethod: ShippingMethod;
  pointsToRedeem?: number; // optional: redeem loyalty points
}

export interface TotalsResult {
  subtotal: number;
  tax: number;
  taxRate: number;
  shipping: number;
  pointsDiscount?: number; // KES discount from points
  pointsRedeemed?: number; // number of points used
  total: number; // final total after discount
}

// Placeholder business rules: VAT 16%, shipping flat rates
const TAX_RATE = 0.16;
const SHIPPING_RATES: Record<ShippingMethod, number> = {
  standard: 350,
  express: 850,
};

export function computeTotals({ items, shippingMethod, pointsToRedeem }: TotalsInput): TotalsResult {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = SHIPPING_RATES[shippingMethod] ?? SHIPPING_RATES.standard;
  
  let pointsDiscount = 0;
  let pointsRedeemed = 0;
  
  if (pointsToRedeem && pointsToRedeem > 0) {
    // 1 point = 1 KES discount (can be configured via env)
    const pointValue = parseFloat(process.env.LOYALTY_POINT_VALUE_KES || '1');
    pointsDiscount = Math.round(pointsToRedeem * pointValue);
    pointsRedeemed = pointsToRedeem;
  }
  
  // Total after discount (minimum 0)
  const total = Math.max(0, subtotal + tax + shipping - pointsDiscount);
  
  return { 
    subtotal, 
    tax, 
    taxRate: TAX_RATE, 
    shipping, 
    pointsDiscount: pointsDiscount > 0 ? pointsDiscount : undefined,
    pointsRedeemed: pointsRedeemed > 0 ? pointsRedeemed : undefined,
    total 
  };
}
