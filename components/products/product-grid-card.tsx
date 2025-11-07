'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { shimmer, toBase64 } from '@/lib/shimmer';
import { cn } from '@/lib/utils';

interface ProductGridCardProps {
  product: Product;
}

export function ProductGridCard({ product }: ProductGridCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
          {/* Image Container */}
          <AspectRatio ratio={3 / 4}>
            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800" />
            )}
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className={cn(
                'object-cover transition-all duration-500 group-hover:scale-110',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 933))}`}
              onLoad={() => setLoaded(true)}
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />

            {/* Quick Actions */}
            <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorite(!isFavorite);
                }}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    isFavorite && 'fill-primary text-primary'
                  )}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  // Add to cart logic
                }}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {product.isNew && (
                <Badge className="bg-primary text-white">New</Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-secondary text-white">Best Seller</Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-accent text-white">-{discount}%</Badge>
              )}
              {!product.inStock && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
          </AspectRatio>
        </div>

        {/* Product Info */}
        <div className="mt-3 space-y-1">
          {/* Brand */}
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className="line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              KES {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                KES {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductGridCardSkeleton() {
  return (
    <div className="space-y-3">
      <AspectRatio ratio={3 / 4}>
        <Skeleton className="h-full w-full rounded-lg" />
      </AspectRatio>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}
