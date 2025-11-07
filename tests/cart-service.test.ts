import { describe, it, expect, beforeEach } from 'vitest';
import { addItem, getCart, updateItem, removeItem, mergeCarts, clearCart } from '@/lib/cart/cart-service';

const user = (n: number) => ({ userId: `u${n}` });
const session = (n: number) => ({ sessionId: `s${n}` });

describe('cart service', () => {
  beforeEach(async () => {
    // isolate carts between tests
    await clearCart(user(1)).catch(() => {});
    await clearCart(session(1)).catch(() => {});
    await clearCart(user(2)).catch(() => {});
    await clearCart(session(2)).catch(() => {});
  });

  it('adds and merges quantities for same product/variant', async () => {
    await addItem(session(1), { productId: 'p1', title: 'Serum', price: 1500, quantity: 1 });
    await addItem(session(1), { productId: 'p1', title: 'Serum', price: 1500, quantity: 2 });
    const cart = await getCart(session(1));
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.subtotal).toBe(4500);
  });

  it('updates quantity and removes when quantity < 1', async () => {
    let cart = await addItem(session(1), { productId: 'p2', title: 'Moisturizer', price: 2000, quantity: 2 });
    const id = cart.items[0].id;
    cart = await updateItem(session(1), { id, quantity: 5 });
    expect(cart.items[0].quantity).toBe(5);
    cart = await updateItem(session(1), { id, quantity: 0 });
    expect(cart.items).toHaveLength(0);
  });

  it('removes item by id', async () => {
    let cart = await addItem(session(1), { productId: 'p3', title: 'Cleanser', price: 1200, quantity: 1 });
    const id = cart.items[0].id;
    cart = await removeItem(session(1), id);
    expect(cart.items).toHaveLength(0);
  });

  it('merges anonymous session cart into user cart', async () => {
    // user has one item
    await addItem(user(1), { productId: 'p1', title: 'Serum', price: 1500, quantity: 1 });
    // session has overlapping and new item
    await addItem(session(1), { productId: 'p1', title: 'Serum', price: 1500, quantity: 2 });
    await addItem(session(1), { productId: 'p4', title: 'Sunscreen', price: 2500, quantity: 1 });

    const merged = await mergeCarts({ userId: 'u1', sessionId: 's1' });
    expect(merged.items).toHaveLength(2);
    const serum = merged.items.find((i) => i.productId === 'p1');
    expect(serum?.quantity).toBe(3);
    expect(merged.subtotal).toBe(1500 * 3 + 2500 * 1);

    // session cart should be cleared
    const sessionCart = await getCart(session(1));
    expect(sessionCart.items).toHaveLength(0);
  });
});
