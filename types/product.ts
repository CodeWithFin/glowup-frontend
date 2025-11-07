export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  brand: string;
  category: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  skinTypes?: string[];
  concerns?: string[];
  ingredients?: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProductFilters {
  skinTypes?: string[];
  concerns?: string[];
  brands?: string[];
  ingredients?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  filters?: ProductFilters;
  sortBy?: 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  pageSize?: number;
}

export const SKIN_TYPES = [
  'Dry',
  'Oily',
  'Combination',
  'Normal',
  'Sensitive',
] as const;

export const SKIN_CONCERNS = [
  'Acne',
  'Anti-Aging',
  'Dark Spots',
  'Hyperpigmentation',
  'Fine Lines',
  'Wrinkles',
  'Dullness',
  'Uneven Texture',
  'Large Pores',
  'Redness',
  'Dehydration',
] as const;

export const POPULAR_BRANDS = [
  'GlowUp',
  'Fenty Beauty',
  'The Ordinary',
  'CeraVe',
  'Glossier',
  'Drunk Elephant',
  'Paula\'s Choice',
  'La Roche-Posay',
] as const;

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
] as const;
