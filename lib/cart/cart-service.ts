import { kv } from '@/lib/redis';
import { CART_TTL_SECONDS, type Cart, type CartItem, type AddCartItemInput, type UpdateCartItemInput, type Identity } from '@/types/cart';
import { randomUUID } from 'crypto';

const cartKey = (identity: Identity) => {
  if (identity.userId) return `cart:user:${identity.userId}`;
  if (identity.sessionId) return `cart:session:${identity.sessionId}`;
  throw new Error('Missing identity');
};

const computeSubtotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

async function readCart(identity: Identity): Promise<Cart | null> {
  const key = cartKey(identity);
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Cart;
  } catch {
    return null;
  }
}

async function writeCart(identity: Identity, cart: Cart): Promise<Cart> {
  const key = cartKey(identity);
  cart.subtotal = computeSubtotal(cart.items);
  cart.updatedAt = Date.now();
  await kv.set(key, JSON.stringify(cart), CART_TTL_SECONDS);
  return cart;
}

export async function getOrCreateCart(identity: Identity): Promise<Cart> {
  const existing = await readCart(identity);
  if (existing) {
    // touch TTL
    await writeCart(identity, existing);
    return existing;
  }
  const cart: Cart = {
    id: cartKey(identity),
    userId: identity.userId,
    sessionId: identity.sessionId,
    items: [],
    currency: 'KES',
    subtotal: 0,
    updatedAt: Date.now(),
  };
  return writeCart(identity, cart);
}

export async function addItem(identity: Identity, input: AddCartItemInput): Promise<Cart> {
  const cart = await getOrCreateCart(identity);
  const qty = Math.max(1, input.quantity ?? 1);

  // merge by productId+variantId
  const keyMatch = (i: CartItem) => i.productId === input.productId && i.variantId === input.variantId;
  const existing = cart.items.find(keyMatch);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.unshift({
      id: randomUUID(),
      productId: input.productId,
      title: input.title,
      price: input.price,
      imageUrl: input.imageUrl,
      quantity: qty,
      variantId: input.variantId,
      addedAt: Date.now(),
    });
  }
  return writeCart(identity, cart);
}

export async function updateItem(identity: Identity, update: UpdateCartItemInput): Promise<Cart> {
  const cart = await getOrCreateCart(identity);
  const idx = cart.items.findIndex((i) => i.id === update.id);
  if (idx === -1) return cart;
  if (update.quantity !== undefined) {
    if (update.quantity < 1) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = update.quantity;
    }
  }
  return writeCart(identity, cart);
}

export async function removeItem(identity: Identity, id: string): Promise<Cart> {
  const cart = await getOrCreateCart(identity);
  cart.items = cart.items.filter((i) => i.id !== id);
  return writeCart(identity, cart);
}

export async function clearCart(identity: Identity): Promise<void> {
  const key = cartKey(identity);
  await kv.del(key);
}

export async function getCart(identity: Identity): Promise<Cart> {
  return getOrCreateCart(identity);
}

// Merge anonymous session cart into user cart after login
export async function mergeCarts({ userId, sessionId }: { userId: string; sessionId?: string }): Promise<Cart> {
  const userIdentity = { userId };
  const userCart = await getOrCreateCart(userIdentity);

  if (!sessionId) return userCart;

  const sessionIdentity = { sessionId };
  const sessionCart = await readCart(sessionIdentity);
  if (!sessionCart || sessionCart.items.length === 0) return userCart;

  // merge line items (productId + variantId)
  for (const item of sessionCart.items) {
    const existing = userCart.items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    );
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      userCart.items.push(item);
    }
  }

  // clear the session cart
  await clearCart(sessionIdentity);
  return writeCart(userIdentity, userCart);
}
