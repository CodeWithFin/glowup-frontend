import { Product, ProductSearchParams, ProductsResponse } from '@/types/product';

// For demo purposes, using mock data until backend is ready
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Vitamin C Brightening Serum',
    description: 'A powerful brightening serum with 15% pure vitamin C to fade dark spots and even skin tone.',
    price: 2850,
    originalPrice: 3500,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/serum-1.jpg',
    brand: 'GlowUp',
    category: 'Skincare',
    tags: ['Brightening', 'Anti-Aging'],
    rating: 4.8,
    reviewCount: 342,
    inStock: true,
    isNew: true,
    isBestSeller: true,
    skinTypes: ['All'],
    concerns: ['Dark Spots', 'Hyperpigmentation', 'Dullness'],
    ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Vitamin E'],
  },
  {
    id: '2',
    title: 'Niacinamide Face Serum',
    description: 'Oil-free serum with 10% niacinamide to minimize pores and control excess oil.',
    price: 2200,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/serum-2.jpg',
    brand: 'The Ordinary',
    category: 'Skincare',
    tags: ['Pore Care', 'Oil Control'],
    rating: 4.6,
    reviewCount: 528,
    inStock: true,
    isBestSeller: true,
    skinTypes: ['Oily', 'Combination'],
    concerns: ['Large Pores', 'Acne', 'Oily Skin'],
    ingredients: ['Niacinamide', 'Zinc'],
  },
  {
    id: '3',
    title: 'Retinol Night Cream',
    description: 'Advanced anti-aging cream with retinol to reduce fine lines and improve skin texture.',
    price: 3800,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/cream-1.jpg',
    brand: 'Paula\'s Choice',
    category: 'Skincare',
    tags: ['Anti-Aging', 'Night Care'],
    rating: 4.7,
    reviewCount: 218,
    inStock: true,
    skinTypes: ['Normal', 'Dry', 'Combination'],
    concerns: ['Fine Lines', 'Wrinkles', 'Anti-Aging'],
    ingredients: ['Retinol', 'Ceramides', 'Peptides'],
  },
  {
    id: '4',
    title: 'Hyaluronic Acid Moisturizer',
    description: 'Lightweight gel moisturizer with multi-weight hyaluronic acid for intense hydration.',
    price: 2650,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/moisturizer-1.jpg',
    brand: 'CeraVe',
    category: 'Skincare',
    tags: ['Hydration', 'Lightweight'],
    rating: 4.9,
    reviewCount: 892,
    inStock: true,
    isBestSeller: true,
    skinTypes: ['All'],
    concerns: ['Dehydration', 'Dullness'],
    ingredients: ['Hyaluronic Acid', 'Ceramides', 'Glycerin'],
  },
  {
    id: '5',
    title: 'Gentle Foaming Cleanser',
    description: 'pH-balanced cleanser that removes impurities without stripping natural oils.',
    price: 1850,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/cleanser-1.jpg',
    brand: 'La Roche-Posay',
    category: 'Skincare',
    tags: ['Cleansing', 'Gentle'],
    rating: 4.5,
    reviewCount: 456,
    inStock: true,
    skinTypes: ['Sensitive', 'Dry', 'Normal'],
    concerns: ['Sensitive Skin', 'Redness'],
    ingredients: ['Niacinamide', 'Ceramides'],
  },
  {
    id: '6',
    title: 'AHA BHA Exfoliating Toner',
    description: 'Dual-action toner with alpha and beta hydroxy acids for smoother, clearer skin.',
    price: 2400,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/toner-1.jpg',
    brand: 'Paula\'s Choice',
    category: 'Skincare',
    tags: ['Exfoliating', 'Acne'],
    rating: 4.7,
    reviewCount: 634,
    inStock: true,
    isNew: true,
    skinTypes: ['Oily', 'Combination', 'Normal'],
    concerns: ['Acne', 'Uneven Texture', 'Large Pores'],
    ingredients: ['Salicylic Acid', 'Glycolic Acid'],
  },
  {
    id: '7',
    title: 'SPF 50 Sunscreen',
    description: 'Broad-spectrum mineral sunscreen with no white cast, perfect for melanin-rich skin.',
    price: 2950,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/sunscreen-1.jpg',
    brand: 'GlowUp',
    category: 'Skincare',
    tags: ['Sun Protection', 'No White Cast'],
    rating: 4.8,
    reviewCount: 512,
    inStock: true,
    isBestSeller: true,
    skinTypes: ['All'],
    concerns: ['Sun Protection', 'Hyperpigmentation'],
    ingredients: ['Zinc Oxide', 'Niacinamide'],
  },
  {
    id: '8',
    title: 'Rose Hip Seed Oil',
    description: 'Pure, cold-pressed rosehip oil rich in vitamins and essential fatty acids.',
    price: 1950,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/skin-care/oil-1.jpg',
    brand: 'The Ordinary',
    category: 'Skincare',
    tags: ['Facial Oil', 'Natural'],
    rating: 4.4,
    reviewCount: 287,
    inStock: true,
    skinTypes: ['Dry', 'Normal'],
    concerns: ['Dullness', 'Fine Lines'],
    ingredients: ['Rosehip Oil', 'Vitamin A'],
  },
];

export async function fetchProducts(
  params: ProductSearchParams = {}
): Promise<ProductsResponse> {
  const {
    query = '',
    category,
    filters = {},
    sortBy = 'popularity',
    page = 1,
    pageSize = 12,
  } = params;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...MOCK_PRODUCTS];

  // Apply search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery) ||
        p.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }

  // Apply category filter
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  // Apply skin type filter
  if (filters.skinTypes && filters.skinTypes.length > 0) {
    filtered = filtered.filter((p) =>
      p.skinTypes?.some(
        (st) =>
          st === 'All' ||
          filters.skinTypes!.some((fst) => st.toLowerCase().includes(fst.toLowerCase()))
      )
    );
  }

  // Apply concerns filter
  if (filters.concerns && filters.concerns.length > 0) {
    filtered = filtered.filter((p) =>
      filters.concerns!.some((fc) =>
        p.concerns?.some((pc) => pc.toLowerCase().includes(fc.toLowerCase()))
      )
    );
  }

  // Apply brand filter
  if (filters.brands && filters.brands.length > 0) {
    filtered = filtered.filter((p) => filters.brands!.includes(p.brand));
  }

  // Apply ingredients filter
  if (filters.ingredients && filters.ingredients.length > 0) {
    filtered = filtered.filter((p) =>
      filters.ingredients!.some((fi) =>
        p.ingredients?.some((pi) => pi.toLowerCase().includes(fi.toLowerCase()))
      )
    );
  }

  // Apply price range filter
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.priceMax!);
  }

  // Apply stock filter
  if (filters.inStock) {
    filtered = filtered.filter((p) => p.inStock);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popularity':
      default:
        return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
  });

  // Paginate
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const products = filtered.slice(start, end);
  const hasMore = end < total;

  return {
    products,
    total,
    page,
    pageSize,
    hasMore,
  };
}

export async function fetchProductById(id: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_PRODUCTS.find((p) => p.id === id) || null;
}
