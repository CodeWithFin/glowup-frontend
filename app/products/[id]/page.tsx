import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductById } from '@/lib/api/products';
import { shimmer, toBase64 } from '@/lib/shimmer';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await fetchProductById(params.id);
  if (!product) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/products"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to products
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 933))}`}
          />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-semibold">{product.title}</h1>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold">KES {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                KES {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          <div className="mt-6 text-sm">
            {product.inStock ? (
              <span className="text-green-600 dark:text-green-400">In stock</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">Out of stock</span>
            )}
          </div>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-6">
              <h2 className="font-medium">Key Ingredients</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {product.ingredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
